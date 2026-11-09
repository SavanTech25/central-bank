
Agentic Systems
===============

:Version: 2026-11

.. admonition:: Agentic AI
   :class: important

   **Agentic** describes systems where LLMs **plan, use tools and coordinate** over many
   steps with some autonomy. It covers a spectrum — from fixed *workflows* with LLM steps
   to fully autonomous *agents* and *multi-agent* teams.

   More autonomy = more flexibility, but also more cost, latency and risk.


The core workflow patterns
--------------------------

These building blocks (popularised by Anthropic's *Building effective agents*) cover most
real-world needs. Combine them.

1. Prompt chaining
^^^^^^^^^^^^^^^^^^

Split a task into sequential steps; add checks ("gates") between them.

.. mermaid::

   flowchart LR
       I([Input]) --> A[LLM: outline] --> G{Gate OK?}
       G -- yes --> B[LLM: write] --> C[LLM: translate] --> O([Output])
       G -- no --> X([Stop])

*Example:* generate a SQL query → validate it with ``EXPLAIN`` → run → summarise.

2. Routing
^^^^^^^^^^

Classify the input, then send it to a specialised prompt, tool or model.

.. mermaid::

   flowchart LR
       I([Request]) --> R{Router}
       R -- billing --> B[Billing flow]
       R -- tech --> T[Support flow]
       R -- easy --> S[Small, cheap model]

3. Parallelisation
^^^^^^^^^^^^^^^^^^

- **Sectioning:** split independent subtasks and run them at the same time.
- **Voting:** run the same task several times and aggregate (more confidence).

4. Orchestrator – workers
^^^^^^^^^^^^^^^^^^^^^^^^^

A lead LLM breaks the task down **dynamically**, delegates to workers, then synthesises.

.. mermaid::

   flowchart TB
       O[Orchestrator] --> W1[Worker 1]
       O --> W2[Worker 2]
       O --> W3[Worker 3]
       W1 --> S[Synthesis]
       W2 --> S
       W3 --> S

5. Evaluator – optimiser
^^^^^^^^^^^^^^^^^^^^^^^^

One LLM produces, another critiques against criteria, loop until good enough.

6. Autonomous agent
^^^^^^^^^^^^^^^^^^^

The model controls the loop itself (see :doc:`agents`). Use when the number of steps is
unpredictable and you trust the environment's feedback (tests, query results…).


Multi-agent architectures
-------------------------

.. list-table::
   :header-rows: 1
   :widths: 22 48 30

   * - Architecture
     - How it works
     - Good for
   * - **Supervisor**
     - One manager agent routes work to specialist sub-agents and merges results.
     - Most use cases; easy to debug.
   * - **Hierarchical**
     - Supervisors of supervisors.
     - Large tasks (research, big codebases).
   * - **Handoffs / swarm**
     - Agents pass control to each other directly.
     - Customer-support style flows.
   * - **Agent-as-a-tool**
     - A sub-agent is exposed as a tool to a main agent; its context stays isolated.
     - Keeping the main context clean.

.. warning::

   Multi-agent systems multiply tokens (often several times a single agent). Use them
   when the task is truly parallel or needs isolated contexts — not by default.


Agentic RAG
-----------

Classic RAG retrieves once. **Agentic RAG** lets the agent decide *if*, *where* and *how
many times* to search: rewrite the query, choose between a vector index, SQL and web search,
check whether the evidence is sufficient, and search again if not.


Production checklist
--------------------

.. grid:: 1 2 2 2
   :gutter: 2

   .. grid-item-card:: 🛡️ Guardrails

      - Least-privilege tools, read-only by default
      - Human approval for writes / payments / emails
      - Input & output validation, PII masking
      - Treat tool & web content as untrusted (prompt injection)

   .. grid-item-card:: 🔭 Observability

      - Trace every LLM call and tool call
      - OpenTelemetry GenAI conventions, MLflow, Langfuse…
      - Log cost, latency, tokens per run

   .. grid-item-card:: 🧪 Evaluation

      - Final outcome: was the task solved?
      - Trajectory: right tools, right order, no loops?
      - Regression suite on every prompt/model change

   .. grid-item-card:: 💸 Cost & reliability

      - Step / token / time budgets
      - Retries with backoff, timeouts, idempotent tools
      - Cache prompts; cheap models for easy steps


Design principles
-----------------

#. **Start simple** — single call → workflow → agent → multi-agent, only when needed.
#. **Make the plan visible** — let the agent write its plan/to-do list.
#. **Invest in tools** — the agent-computer interface matters as much as the prompt.
#. **Keep humans in the loop** where errors are expensive.
#. **Measure** — no evals, no production.

.. tip::

   Test yourself: :doc:`/quiz/genai_agents`.
