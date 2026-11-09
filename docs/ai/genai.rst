
Generative AI Fundamentals
==========================

:Version: 2026-11

.. admonition:: In one sentence
   :class: important

   Generative AI models learn the patterns of huge datasets and **generate new content**
   (text, code, images, audio…) one piece at a time. Large Language Models (LLMs) do it
   for text by predicting the **next token** over and over.


How an LLM works
----------------

.. list-table::
   :header-rows: 1
   :widths: 22 78

   * - Concept
     - What you need to know
   * - **Token**
     - The unit an LLM reads and writes (≈ ¾ of an English word). Pricing, limits and speed
       are all counted in tokens.
   * - **Context window**
     - Max tokens the model can "see" at once (prompt + history + documents + answer).
       Modern frontier models reach hundreds of thousands to ~1M tokens.
   * - **Transformer**
     - The neural architecture behind LLMs. *Attention* lets every token look at every
       other token in the context.
   * - **Pre-training**
     - Learning to predict the next token on trillions of tokens of public text and code.
   * - **Post-training**
     - Instruction tuning + preference training (RLHF / RLAIF) turns a raw model into a
       helpful, safe assistant.
   * - **Reasoning models**
     - Models that "think" (generate hidden reasoning) before answering. More thinking
       (*test-time compute*) usually means better answers on hard tasks, at higher cost
       and latency — often controlled by an *effort* setting.
   * - **Embeddings**
     - Vectors that represent the meaning of text. Similar meaning → close vectors.
       The basis of semantic search and RAG.
   * - **Multimodal**
     - Models that take images, PDFs, audio (and sometimes produce them) in addition to text.


Model landscape
^^^^^^^^^^^^^^^

.. tab:: Proprietary (API)

   - **Anthropic** — Claude (Opus, Sonnet, Haiku families)
   - **OpenAI** — GPT and o-series reasoning models
   - **Google** — Gemini
   - Usually the strongest models; you pay per token; data stays with the provider
     (check retention terms).

.. tab:: Open-weight

   - **Meta** Llama, **Mistral**, **Alibaba** Qwen, **DeepSeek**, **Google** Gemma…
   - Download the weights and self-host (vLLM, Ollama, TGI) or use a hosted endpoint
     (Groq, Together, Databricks, Snowflake Cortex…).
   - Full control, fine-tunable, but you operate the infrastructure.

.. tip::

   Pick the **smallest model that passes your evaluation**, not the biggest one.
   Model names change every few months — your eval set is what lets you switch quickly.


Prompt engineering
------------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Technique
     - When / how
   * - System prompt
     - Define role, tone, rules and output format once, at the top.
   * - Zero-shot
     - Just ask clearly. Works for most simple tasks with modern models.
   * - Few-shot
     - Give 2–5 input → output examples to fix style or format.
   * - Chain of thought
     - Ask the model to reason step by step (or use a reasoning model).
   * - Structured output
     - Ask for JSON that follows a schema — most APIs can **enforce** a JSON schema.
   * - Prompt chaining
     - Split a complex task into several smaller prompts (see :doc:`agentic`).
   * - Delimiters
     - Wrap documents in tags (``<document>…</document>``) so the model knows what is data
       and what is instruction.

.. code-block:: text
   :caption: A solid prompt skeleton

   ROLE      You are a senior data engineer reviewing SQL for a bank.
   CONTEXT   <schema> ... </schema>
   TASK      Review the query below for correctness and performance.
   RULES     - Only use tables from the schema.  - Say "unknown" if unsure.
   FORMAT    JSON: {"issues": [{"line": int, "severity": "low|med|high", "fix": str}]}
   INPUT     <query> ... </query>


Customising a model: the ladder
-------------------------------

Climb only as high as you need — each step costs more.

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - Approach
     - Use it when…
     - Watch out for…
   * - **Prompting**
     - Always the first step. Cheap and instant to iterate.
     - Long prompts cost tokens (use *prompt caching*).
   * - **RAG**
     - The model needs **your knowledge** (docs, tickets, tables) or fresh data.
     - Retrieval quality is the bottleneck. See :doc:`rag`.
   * - **Tool use / agents**
     - The model must **act** or fetch live data (APIs, SQL, search).
     - Loops, cost and safety. See :doc:`agents`.
   * - **Fine-tuning** (LoRA / PEFT)
     - You need a specific **style/format/behaviour** at scale, or a smaller, cheaper model.
     - Needs quality labelled data; doesn't add reliable *knowledge*.
   * - **Pre-training**
     - Almost never. Only for labs or very specific domains.
     - Millions of dollars.


Evaluation (evals)
------------------

"It looks good on 3 examples" is not an evaluation.

1. **Build a golden dataset** — 50–200 real inputs with expected outputs or grading criteria.
2. **Choose graders** — exact match / code checks when possible; *LLM-as-a-judge* with a
   clear rubric otherwise; humans for spot checks.
3. **Track metrics** — accuracy, faithfulness (no hallucination), relevance, latency, cost.
4. **Run on every change** (prompt, model, retrieval) like unit tests.

Useful tools: **RAGAS**, **DeepEval**, **promptfoo**, **MLflow** (GenAI evaluation & tracing),
**Langfuse**, **Arize Phoenix**.


Risks & mitigations
-------------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Risk
     - Mitigation
   * - Hallucination
     - Ground answers in retrieved sources, require citations, let the model say "I don't know".
   * - Prompt injection
     - Treat retrieved/web/tool content as **data, never instructions**; least-privilege tools;
       human approval for sensitive actions.
   * - Data leakage / privacy
     - Mask PII, check provider data-retention, keep secrets out of prompts.
   * - Cost & latency
     - Smaller models for easy steps, prompt caching, batching, streaming.
   * - Bias & compliance
     - Evaluate on diverse cases; follow your regulation (e.g. the EU AI Act).


Glossary
--------

.. glossary::

   Temperature
      Randomness of sampling. Low = deterministic, high = creative. Some recent reasoning
      models fix it and expose an *effort* setting instead.

   Hallucination
      A fluent but false answer.

   Grounding
      Forcing the answer to rely on provided sources.

   Prompt caching
      Re-using an already-processed prompt prefix to cut cost and latency.

   Guardrails
      Input/output checks around a model (filters, validators, policies).

   Quantization
      Storing weights in fewer bits (8, 4…) to run models on smaller hardware.
