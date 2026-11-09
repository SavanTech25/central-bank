
What's New (2025 – 2026)
========================

:Last review: 2026-11-09

A curated timeline of the releases that matter. Product names and preview/GA status move
fast — **always confirm in the official release notes** before relying on a feature.

.. tip::

   **The big trend:** both platforms are becoming *agentic platforms*. Your data, a semantic /
   context layer, governed access to LLMs and MCP, and agents that business users talk to.


❄️ Snowflake
------------

.. tab:: 2026

   **Expedition 2026 (early November)**

   - **Business Ontology** — business context layer for agents.
   - **Cortex AI Gateway** governance expanded: agent abuse detection, observability &
     tracing, Cortex sandboxes, AI cost governance, dynamic model routing.
   - **Cortex Training** (public preview) — tailor open-weight models with your own data.
   - Autonomous data-engineering features.

   **Autumn 2026 (release notes)**

   - Oct — **Cortex Agent SDK** in public preview.
   - Sep — Cortex Agents object enhancements GA; **temporary (session-scoped) agents**;
     lineage and a compact API in preview.
   - Aug — Cortex Agents **asynchronous API** and the **Coding Agent** GA. Snowflake
     recommends moving from Cortex Analyst to **Cortex Agents**.

   **Snowflake Summit 26 (June 1–4, San Francisco)** — theme: *the agentic enterprise*

   - **Snowflake Intelligence → CoWork** (assistant for knowledge workers).
   - **Cortex Code → CoCo** (coding assistant for developers).
   - **Cortex Sense** — context layer used by CoWork and CoCo, with plugins & MCP connectors.
   - Infrastructure bets: **Iceberg v3**, **Datastream**, **Adaptive Compute** (later GA).
   - Expanded Horizon Catalog AI governance; acquisition of **Natoma** (governed agent access
     to enterprise systems).

.. tab:: 2025

   **Snowflake Summit 25 (June)**

   - **Snowflake Intelligence** (preview) — natural-language agents for business users.
   - **Cortex AISQL** — AI functions in SQL (``AI_FILTER``, ``AI_AGG``, ``AI_CLASSIFY``…).
   - **Openflow** — managed data integration based on Apache NiFi.
   - **Gen2 standard warehouses** and **Adaptive Compute** (preview).
   - **Semantic views**, **Workspaces**, **dbt Projects on Snowflake**.
   - Acquisition of **Crunchy Data** → **Snowflake Postgres**.

   **Later in 2025** — Snowflake Intelligence and Cortex Agents reach general availability
   (around November 2025).


🧱 Databricks
-------------

.. tab:: 2026

   **Data + AI Summit 2026 (June 15–18, San Francisco)**

   - **Agent Bricks** becomes a full agent platform: model choice (proprietary + open),
     **managed agent memory backed by Lakebase**, support for LangGraph, CrewAI and the
     Claude Agent SDK.
   - **Lakebase** matures (reported GA) — serverless Postgres with scale-to-zero and instant
     branching; **Lakebase Search** (beta) for large-scale vector search.
   - **Genie One** (agentic coworker producing reports & artifacts) and the Genie family:
     Genie Agents, **Genie Code**, Genie App Builder, built on **Genie Ontology**.
   - **Unity AI Gateway** — governance for agents, LLM endpoints, MCP servers and coding
     tools, with hard spend caps.
   - **LTAP** (beta) — unify transactional and analytical processing without ETL;
     **Lakehouse//RT** for real time.
   - **Free Edition** expanded (Genie Code, serverless GPUs, Lakebase, Agent Bricks,
     Lakeflow Designer).

.. tab:: 2025

   **Data + AI Summit 2025 (June)**

   - **Lakebase** (preview) — Postgres in the lakehouse, after the **Neon** acquisition.
   - **Agent Bricks** (beta) — auto-optimised agents for common tasks.
   - **Databricks One** — simplified experience for business users.
   - **Lakeflow** GA and **Lakeflow Designer** (no-code pipelines).
   - DLT open-sourced into Apache Spark as **Spark Declarative Pipelines**.
   - **Databricks Free Edition** and a large free training offer.
   - **Unity Catalog** metrics and Iceberg improvements; **Databricks Apps** GA;
     **MLflow 3** for GenAI.


🤖 AI ecosystem
---------------

- **MCP** became the de-facto standard to plug tools into agents; it is now hosted by the
  Linux Foundation's **Agentic AI Foundation** (with AGENTS.md and other projects).
- **A2A** (agent-to-agent) moved to the Linux Foundation.
- Frontier models now ship **reasoning / effort controls**, ~1M-token contexts and strong
  tool use; "computer use" and coding agents are mainstream.
- Agent SDKs everywhere: Claude Agent SDK, OpenAI Agents SDK, Google ADK, Microsoft Agent
  Framework — and in-platform agents (Cortex Agents, Agent Bricks).
- Governance moves to **AI gateways** (Snowflake Cortex AI Gateway, Databricks Unity AI
  Gateway) that control models, MCP servers, costs and guardrails.


Sources
-------

- Snowflake release notes — https://docs.snowflake.com/en/release-notes/new-features-2026
- Cortex Agents GA notes (Sep 2026) — https://docs.snowflake.com/en/release-notes/2026/other/2026-09-16-cortex-agents-object-enhancements-ga
- SiliconANGLE, Snowflake expands agentic AI platform (Nov 2026) — https://siliconangle.com/2026/11/03/snowflake-expands-agentic-ai-platform-with-business-context-and-governance-tools/
- Snowflake Summit 2026 summary — https://medium.com/snowflake/snowflake-summit-2026-summary-of-new-features-09f3d5ffeefe
- Constellation Research, Summit 2026 — https://www.constellationr.com/insights/news/snowflake-summit-2026-context-custom-model-training-iceberg-v3
- Databricks blog, Agent Bricks at DAIS 2026 — https://www.databricks.com/blog/agent-bricks-dais-2026
- Atlan, DAIS 2026 recap — https://atlan.com/know/ai-agent/databricks/databricks-data-ai-summit-2026-announcements/
- Qubika, DAIS 2026 recap — https://qubika.com/blog/everything-databricks-announced-dais-data-ai-summit-2026/
- Databricks release notes — https://docs.databricks.com/aws/en/release-notes/
