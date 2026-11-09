// Build the embeddings index for the in-browser "Ask the docs" bot.
//
// Usage: node scripts/embed-index.mjs <sphinx-html-output-dir>
// Reads  <dir>/search-chunks.json  (written by docs/_ext/askbot.py)
// Writes <dir>/search-index.json   (chunks + embeddings, loaded by _static/askbot.js)
//
// The model, dtype and "passage: " prefix MUST match docs/_static/askbot.js.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/multilingual-e5-small";
const DTYPE = "q8";
const BATCH = 16;

const outDir = process.argv[2];
if (!outDir) {
  console.error("usage: node embed-index.mjs <sphinx-html-output-dir>");
  process.exit(1);
}

const chunks = JSON.parse(await readFile(join(outDir, "search-chunks.json"), "utf8"));
const extractor = await pipeline("feature-extraction", MODEL, { dtype: DTYPE });

const vectors = [];
for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH).map((c) => `passage: ${c.page} — ${c.section}\n${c.text}`);
  const output = await extractor(batch, { pooling: "mean", normalize: true });
  for (const row of output.tolist()) vectors.push(row.map((x) => Math.round(x * 1e4) / 1e4));
  process.stdout.write(`\rembedded ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
}

const index = { model: MODEL, dtype: DTYPE, chunks: chunks.map((c, i) => ({ ...c, v: vectors[i] })) };
await writeFile(join(outDir, "search-index.json"), JSON.stringify(index));
console.log(`\nwrote ${join(outDir, "search-index.json")}`);
