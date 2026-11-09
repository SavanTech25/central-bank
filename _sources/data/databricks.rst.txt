
Databricks
==========

:Version: 2026-11

.. admonition:: In one sentence
   :class: important

   Databricks is a **lakehouse** platform built by the creators of Apache Spark: your data
   lives in open formats (**Delta Lake** / Iceberg) in your cloud storage, **Unity Catalog**
   governs it, and you run SQL, Python, ML and **AI agents** on top.


The lakehouse
-------------

.. mermaid::

   flowchart LR
       S[Sources<br/>DBs · SaaS · files · streams] --> B[(Bronze<br/>raw)]
       B --> SI[(Silver<br/>cleaned)]
       SI --> G[(Gold<br/>business aggregates)]
       G --> BI[SQL / BI / Genie]
       G --> ML[ML & Agents]
       UC{{Unity Catalog — governance, lineage, access}} -.-> B & SI & G

*Lakehouse* = the cheap, open storage of a **data lake** + the reliability and performance
of a **data warehouse**. The bronze/silver/gold layering is the **medallion architecture**.


Core components
---------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Component
     - What it does
   * - **Delta Lake**
     - Open table format on Parquet with ACID transactions, time travel, ``MERGE``, schema
       enforcement. *UniForm* exposes Delta tables as Iceberg too.
   * - **Unity Catalog**
     - Central governance: ``catalog.schema.table`` namespace, permissions, lineage, audit,
       metrics, and governance of models/functions/agents. Open-sourced.
   * - **Compute**
     - All-purpose clusters (interactive), job clusters, **serverless** compute and
       **SQL warehouses** (Photon engine).
   * - **Lakeflow**
     - Data engineering suite: *Connect* (ingestion), *Declarative Pipelines* (formerly DLT),
       *Jobs* (orchestration, formerly Workflows), *Designer* (no-code).
   * - **Databricks SQL & AI/BI**
     - Warehouse, dashboards, and **Genie** (ask questions in natural language).
   * - **Mosaic AI**
     - Model Serving, Vector Search, AI Gateway, fine-tuning, evaluation.
   * - **MLflow**
     - Experiment tracking, model registry and — since MLflow 3 — GenAI tracing & evaluation.
   * - **Agent Bricks**
     - Platform to build, evaluate and deploy AI agents on your data (multiple models,
       managed memory, MCP).
   * - **Lakebase**
     - Serverless Postgres (from the Neon acquisition) for apps and agent state, synced with
       the lakehouse.
   * - **Databricks Apps**
     - Host data & AI apps (Streamlit, Dash, Gradio, React…) inside the workspace.
   * - **Delta Sharing**
     - Open protocol to share live data across platforms and clouds.


Quick code tour
^^^^^^^^^^^^^^^

.. tab:: PySpark + Delta

   .. code-block:: python

      # Read raw JSON, clean it, write a Delta table governed by Unity Catalog
      raw = spark.read.json("/Volumes/main/landing/orders/")
      clean = (raw.dropDuplicates(["order_id"])
                  .filter("amount > 0"))
      clean.write.mode("overwrite").saveAsTable("main.silver.orders")

.. tab:: SQL (MERGE / time travel)

   .. code-block:: sql

      MERGE INTO main.silver.customers AS t
      USING updates AS s
      ON t.customer_id = s.customer_id
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *;

      -- Time travel
      SELECT * FROM main.silver.customers VERSION AS OF 12;

.. tab:: Declarative pipeline

   .. code-block:: python

      import dlt  # Lakeflow Declarative Pipelines (also: pyspark.pipelines)

      @dlt.table(comment="Raw orders from cloud storage")
      def bronze_orders():
          return (spark.readStream.format("cloudFiles")
                  .option("cloudFiles.format", "json")
                  .load("/Volumes/main/landing/orders/"))

      @dlt.table
      @dlt.expect_or_drop("valid_amount", "amount > 0")
      def silver_orders():
          return dlt.read_stream("bronze_orders").dropDuplicates(["order_id"])

.. tab:: AI functions

   .. code-block:: sql

      SELECT
        ticket_id,
        ai_classify(body, ARRAY('billing', 'bug', 'feature')) AS category,
        ai_summarize(body, 30)                               AS summary,
        ai_query('databricks-meta-llama-3-3-70b-instruct',
                 CONCAT('Draft a polite reply to: ', body))  AS draft_reply
      FROM main.support.tickets
      LIMIT 20;


AI & agents on Databricks
-------------------------

- **Genie** family — natural-language analytics (*Genie spaces*), and newer agentic
  products such as *Genie One* and *Genie Code*.
- **Agent Bricks** — describe the task, connect data, Databricks builds/optimises the agent
  and its evaluation; supports frameworks such as LangGraph, CrewAI and the Claude Agent SDK.
- **Vector Search** — managed embeddings index synced from Delta tables (RAG).
- **AI Gateway** (Unity AI Gateway) — one governed entry point for LLMs, agents and MCP
  servers: permissions, rate limits, spend caps, guardrails, logging.
- **MLflow 3** — traces every LLM/tool call, LLM judges for evaluation, human feedback.


Cost tips
---------

- Prefer **serverless** or **job clusters** for pipelines; all-purpose clusters only for exploration.
- Set **auto-termination** on clusters and use cluster **policies**.
- Use **liquid clustering** and ``OPTIMIZE`` / predictive optimisation on big tables.
- Tag workloads and follow the **system tables** (``system.billing.usage``) for cost tracking.


Certifications
--------------

- **Data Engineer** — Associate / Professional
- **Data Analyst** — Associate
- **Machine Learning** — Associate / Professional
- **Generative AI Engineer** — Associate
- Platform/Partner accreditations (fundamentals, platform admin…)


Useful links
------------

- Documentation: https://docs.databricks.com/
- Free Edition (learn for free): https://www.databricks.com/learn/free-edition
- Training & certification: https://www.databricks.com/learn/training
- Release notes: https://docs.databricks.com/aws/en/release-notes/
- Community: https://community.databricks.com/
