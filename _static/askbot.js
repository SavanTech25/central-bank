// "Ask the docs" — a 100% in-browser assistant. No API key, no server.
//
// Level 1 (everyone): keyword search instantly, then semantic search with a small
//   multilingual embedding model (Transformers.js, ~118 MB, cached by the browser).
// Level 2 (opt-in, WebGPU): a small open-weight LLM (WebLLM) writes an answer
//   from the retrieved passages, citing them.
//
// The embedding model / dtype / prefixes must match scripts/embed-index.mjs.

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.86";
const EMBED_MODEL = "Xenova/multilingual-e5-small";
const EMBED_DTYPE = "q8";
// First one available in WebLLM's catalogue wins (f16 needs the "shader-f16" GPU feature).
const LLM_CANDIDATES = {
  f16: ["Qwen2.5-1.5B-Instruct-q4f16_1-MLC", "Qwen2.5-0.5B-Instruct-q4f16_1-MLC"],
  f32: ["Qwen2.5-1.5B-Instruct-q4f32_1-MLC", "Qwen2.5-0.5B-Instruct-q4f32_1-MLC"],
};
const TOP_K = 5;
const LLM_CONTEXT_CHUNKS = 4;
const LLM_FLAG = "cb-askbot-llm";

const ROOT = document.documentElement.dataset.content_root || "./";

// ---------------------------------------------------------------- storage helpers
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

// ---------------------------------------------------------------- index & search
let indexPromise = null;
function loadIndex() {
  indexPromise ??= (async () => {
    let res = await fetch(`${ROOT}search-index.json`);
    if (res.ok) return { chunks: (await res.json()).chunks, needsEmbedding: false };
    // Dev builds without the Node step: embed passages in the browser instead.
    res = await fetch(`${ROOT}search-chunks.json`);
    if (!res.ok) throw new Error("search index not found");
    return { chunks: await res.json(), needsEmbedding: true };
  })();
  return indexPromise;
}

let extractorPromise = null;
function loadExtractor(onProgress) {
  extractorPromise ??= (async () => {
    const { pipeline, env } = await import(TRANSFORMERS_URL);
    env.allowLocalModels = false;
    return pipeline("feature-extraction", EMBED_MODEL, {
      dtype: EMBED_DTYPE,
      progress_callback: (p) => {
        if (p.status === "progress" && p.file?.endsWith(".onnx")) onProgress?.(p.progress);
      },
    });
  })();
  return extractorPromise;
}

async function embed(texts) {
  const extractor = await extractorPromise;
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  return out.tolist();
}

async function ensureChunkVectors(index, onStatus) {
  if (!index.needsEmbedding) return;
  for (let i = 0; i < index.chunks.length; i += 16) {
    onStatus(`Indexing the site locally… ${i}/${index.chunks.length}`);
    const batch = index.chunks.slice(i, i + 16);
    const vecs = await embed(batch.map((c) => `passage: ${c.page} — ${c.section}\n${c.text}`));
    batch.forEach((c, j) => (c.v = vecs[j]));
  }
  index.needsEmbedding = false;
}

const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const terms = (s) => [...new Set(normalize(s).match(/[a-z0-9]{3,}/g) || [])];

function keywordScore(chunk, qTerms) {
  if (!qTerms.length) return 0;
  const body = normalize(`${chunk.page} ${chunk.section} ${chunk.text}`);
  const head = normalize(`${chunk.page} ${chunk.section}`);
  let s = 0;
  for (const t of qTerms) if (body.includes(t)) s += head.includes(t) ? 1.5 : 1;
  return s / (qTerms.length * 1.5);
}

function rank(chunks, question, qVec) {
  const qTerms = terms(question);
  const scored = chunks.map((c) => {
    let score = keywordScore(c, qTerms);
    if (qVec && c.v) {
      let dot = 0;
      for (let i = 0; i < qVec.length; i++) dot += qVec[i] * c.v[i];
      score = dot + 0.15 * score;
    }
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set();
  return scored
    .filter(({ c, score }) => score > 0 && !seen.has(c.url) && seen.add(c.url))
    .slice(0, TOP_K)
    .map(({ c }) => c);
}

// ---------------------------------------------------------------- local LLM
let enginePromise = null;
let engineModel = null;

async function pickModel(webllm) {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) throw new Error("No WebGPU adapter available");
  const kind = adapter.features.has("shader-f16") ? "f16" : "f32";
  const available = new Set(webllm.prebuiltAppConfig.model_list.map((m) => m.model_id));
  const id = LLM_CANDIDATES[kind].find((m) => available.has(m));
  if (!id) throw new Error("No compatible model in the WebLLM catalogue");
  return id;
}

function loadEngine(onStatus) {
  enginePromise ??= (async () => {
    const webllm = await import(WEBLLM_URL);
    engineModel = await pickModel(webllm);
    return webllm.CreateMLCEngine(engineModel, {
      initProgressCallback: (r) => onStatus(r.text),
    });
  })().catch((err) => {
    enginePromise = null;
    throw err;
  });
  return enginePromise;
}

async function generate(question, passages, onToken, onStatus) {
  const engine = await loadEngine(onStatus);
  const context = passages
    .slice(0, LLM_CONTEXT_CHUNKS)
    .map((c, i) => `[${i + 1}] ${c.page} — ${c.section}\n${c.text}`)
    .join("\n\n");
  const stream = await engine.chat.completions.create({
    stream: true,
    temperature: 0.2,
    max_tokens: 450,
    messages: [
      {
        role: "system",
        content:
          "You are the assistant of the 'Central Bank' documentation website about data and AI. " +
          "Answer ONLY with information from the numbered excerpts. Cite them like [1] or [2]. " +
          "If the excerpts do not contain the answer, say you could not find it on the site. " +
          "Be concise. Always answer in the same language as the question.",
      },
      { role: "user", content: `Excerpts:\n${context}\n\nQuestion: ${question}` },
    ],
  });
  for await (const part of stream) onToken(part.choices[0]?.delta?.content || "");
}

// ---------------------------------------------------------------- UI
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

function buildUI() {
  const fab = el("button", { class: "cb-ask-fab", type: "button", "aria-haspopup": "dialog" }, "✨ Ask the docs");
  const input = el("input", {
    class: "cb-ask-input", type: "text", placeholder: "Ask anything about this site…",
    "aria-label": "Your question", autocomplete: "off",
  });
  const submit = el("button", { class: "cb-ask-submit", type: "submit" }, "Ask");
  const status = el("p", { class: "cb-ask-status", "aria-live": "polite" });
  const answer = el("div", { class: "cb-ask-answer", hidden: "" });
  const llmBtn = el("button", { class: "cb-ask-llm", type: "button", hidden: "" });
  const results = el("ol", { class: "cb-ask-results" });
  const close = el("button", { class: "cb-ask-close", type: "button", "aria-label": "Close" }, "✕");
  const panel = el(
    "div",
    { class: "cb-ask-panel", role: "dialog", "aria-label": "Ask the docs", hidden: "" },
    el("div", { class: "cb-ask-head" },
      el("div", {}, el("strong", {}, "Ask the docs"),
        el("span", { class: "cb-ask-badge" }, "Runs locally · no key")),
      close),
    el("form", { class: "cb-ask-form" }, input, submit),
    status, answer, llmBtn, results,
    el("p", { class: "cb-ask-foot" },
      "Everything runs in your browser. Models are downloaded once from Hugging Face, then cached."),
  );
  document.body.append(fab, panel);
  return { fab, panel, input, status, answer, llmBtn, results, close, form: panel.querySelector("form") };
}

// Minimal, safe Markdown → DOM (code fences, `code`, **bold**). Never uses innerHTML.
function renderMarkdown(container, text) {
  const inline = (line) => {
    const out = [];
    for (const part of line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)) {
      if (!part) continue;
      if (part.startsWith("`") && part.endsWith("`")) out.push(el("code", {}, part.slice(1, -1)));
      else if (part.startsWith("**") && part.endsWith("**")) out.push(el("strong", {}, part.slice(2, -2)));
      else out.push(part);
    }
    return out;
  };
  const nodes = text.split(/```[\w-]*\n?/).flatMap((block, i) => {
    if (i % 2 === 1) return [el("pre", {}, el("code", {}, block.replace(/\n$/, "")))];
    return block.split(/\n{2,}/).filter((p) => p.trim()).map((p) => el("p", {}, ...inline(p.trim())));
  });
  container.replaceChildren(...nodes);
}

function renderResults(ui, passages) {
  ui.results.replaceChildren(
    ...passages.map((c, i) =>
      el("li", {},
        el("a", { href: ROOT + c.url },
          el("span", { class: "cb-ask-num" }, String(i + 1)),
          el("span", { class: "cb-ask-title" }, `${c.page} › ${c.section}`)),
        el("p", {}, c.text.length > 220 ? `${c.text.slice(0, 220)}…` : c.text)),
    ),
  );
  if (!passages.length) ui.results.replaceChildren(el("li", { class: "cb-ask-empty" }, "No matching content found."));
}

function init() {
  const ui = buildUI();
  const hasWebGPU = "gpu" in navigator;
  let lastQuestion = "";
  let lastPassages = [];
  let busy = false;

  const open = () => {
    ui.panel.hidden = false;
    ui.fab.hidden = true;
    ui.input.focus();
    loadIndex().catch(() => (ui.status.textContent = "Search index not available on this build."));
  };
  const shut = () => {
    ui.panel.hidden = true;
    ui.fab.hidden = false;
    ui.fab.focus();
  };
  ui.fab.addEventListener("click", open);
  ui.close.addEventListener("click", shut);
  document.addEventListener("keydown", (e) => e.key === "Escape" && !ui.panel.hidden && shut());

  const showLlmButton = () => {
    ui.llmBtn.hidden = false;
    if (!hasWebGPU) {
      ui.llmBtn.disabled = true;
      ui.llmBtn.textContent = "Local AI answer unavailable (this browser has no WebGPU)";
    } else {
      ui.llmBtn.disabled = false;
      ui.llmBtn.textContent = enginePromise
        ? "✨ Generate an answer with the local AI"
        : "✨ Generate an answer with the local AI (≈1 GB download, only once)";
    }
  };

  async function runLLM() {
    if (!lastPassages.length || busy) return;
    busy = true;
    ui.llmBtn.hidden = true;
    ui.answer.hidden = false;
    ui.answer.textContent = "";
    ui.answer.classList.add("is-streaming");
    let full = "";
    try {
      await generate(
        lastQuestion,
        lastPassages,
        (token) => (ui.answer.textContent = full += token),
        (text) => (ui.status.textContent = text),
      );
      ui.answer.classList.remove("is-streaming");
      renderMarkdown(ui.answer, full);
      store.set(LLM_FLAG, "1");
      ui.status.textContent = `Answer generated locally by ${engineModel}. Check the sources below.`;
    } catch (err) {
      ui.answer.hidden = true;
      ui.status.textContent = `Local AI failed: ${err.message}`;
      showLlmButton();
    } finally {
      busy = false;
    }
  }
  ui.llmBtn.addEventListener("click", runLLM);

  ui.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = ui.input.value.trim();
    if (!question || busy) return;
    busy = true;
    lastQuestion = question;
    ui.answer.hidden = true;
    ui.llmBtn.hidden = true;
    try {
      const index = await loadIndex();
      // 1) instant keyword results
      lastPassages = rank(index.chunks, question, null);
      renderResults(ui, lastPassages);
      // 2) semantic re-ranking
      ui.status.textContent = "Loading the search model…";
      await loadExtractor((pct) => (ui.status.textContent = `Downloading the search model (118 MB, only once)… ${Math.round(pct)}%`));
      await ensureChunkVectors(index, (t) => (ui.status.textContent = t));
      const [qVec] = await embed([`query: ${question}`]);
      lastPassages = rank(index.chunks, question, qVec);
      renderResults(ui, lastPassages);
      ui.status.textContent = lastPassages.length ? "Most relevant passages:" : "";
    } catch (err) {
      ui.status.textContent = `Semantic search unavailable (${err.message}). Showing keyword results.`;
    } finally {
      busy = false;
    }
    if (lastPassages.length) {
      if (hasWebGPU && store.get(LLM_FLAG) === "1") runLLM();
      else showLlmButton();
    }
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
