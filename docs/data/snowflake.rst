
Snowflake
=========

:Version: 2026-11

.. admonition:: In one sentence
   :class: important

   Snowflake is a fully managed cloud data platform (AWS, Azure, GCP) where **storage and
   compute are separated**, you mostly speak **SQL**, and — since 2024–2026 — you can run
   **AI functions and agents** directly on your governed data.


Architecture
------------

.. mermaid::

   flowchart TB
       CS["☁️ Cloud services<br/>auth · metadata · optimizer · governance (Horizon)"]
       subgraph Compute
         W1[Warehouse XS<br/>ETL]
         W2[Warehouse M<br/>BI]
         W3[Warehouse L<br/>Data science]
       end
       ST[("🗄️ Storage<br/>compressed columnar micro-partitions / Iceberg")]
       CS --- Compute
       Compute --- ST

.. list-table::
   :header-rows: 1
   :widths: 22 78

   * - Layer
     - Role
   * - **Storage**
     - Data stored once in compressed, columnar **micro-partitions** (or open **Apache Iceberg**
       tables in your own bucket).
   * - **Compute**
     - **Virtual warehouses** (XS → 6XL) that you start, stop, resize independently. Many
       warehouses can read the same data without contention. Billed per second in *credits*.
   * - **Cloud services**
     - Authentication, metadata, query optimisation, transactions, security & governance.


Key features to know
--------------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Feature
     - What it gives you
   * - Time Travel & Fail-safe
     - Query or restore data as it was in the past (up to 90 days on Enterprise). ``UNDROP``.
   * - Zero-copy cloning
     - Instant copy of a table/schema/database for dev or tests — no extra storage until changes.
   * - Secure Data Sharing & Marketplace
     - Share live data with other accounts without copying it.
   * - Snowpipe / Snowpipe Streaming
     - Continuous, near-real-time ingestion from files or streams.
   * - Openflow
     - Managed ingestion/integration service (based on Apache NiFi) with many connectors.
   * - Streams & Tasks
     - Change data capture + scheduled SQL — classic incremental pipelines.
   * - Dynamic Tables
     - Declarative pipelines: write a ``SELECT``, set a ``TARGET_LAG``, Snowflake keeps it fresh.
   * - Iceberg tables & Horizon Catalog
     - Open table format; interoperate with Spark, Trino, Databricks… Catalog based on Apache Polaris.
   * - Snowpark
     - Python / Java / Scala DataFrames that execute inside Snowflake.
   * - Notebooks, Workspaces, dbt Projects
     - Develop and run Python/SQL and dbt directly in Snowsight.
   * - Streamlit in Snowflake & Native Apps
     - Build and distribute data apps next to the data.
   * - Snowflake Postgres
     - Managed transactional Postgres in the platform (from the Crunchy Data acquisition).


Quick SQL tour
^^^^^^^^^^^^^^

.. code-block:: sql

   -- Compute: a warehouse that sleeps after 60 s of inactivity
   CREATE WAREHOUSE IF NOT EXISTS transform_wh
     WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60 AUTO_RESUME = TRUE;

   -- Time Travel: data as it was 5 minutes ago
   SELECT * FROM orders AT (OFFSET => -60 * 5);

   -- Zero-copy clone for a dev environment
   CREATE DATABASE analytics_dev CLONE analytics;

   -- Declarative pipeline kept fresh within 15 minutes
   CREATE OR REPLACE DYNAMIC TABLE daily_sales
     TARGET_LAG = '15 minutes'
     WAREHOUSE  = transform_wh
   AS
     SELECT order_date, SUM(amount) AS revenue
     FROM orders
     GROUP BY order_date;


AI in Snowflake: Cortex
-----------------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Service
     - Purpose
   * - **Cortex AI functions** (AISQL)
     - LLMs as SQL functions: ``AI_COMPLETE``, ``AI_CLASSIFY``, ``AI_FILTER``, ``AI_AGG``,
       ``AI_EXTRACT``, ``AI_SENTIMENT``, ``AI_TRANSLATE``, ``AI_PARSE_DOCUMENT``…
   * - **Cortex Search**
     - Managed hybrid (vector + keyword) search over text — the retrieval part of RAG.
   * - **Cortex Analyst** & semantic views
     - Natural language → SQL, using a semantic model of your business metrics.
   * - **Cortex Agents**
     - Agents that orchestrate Cortex Search, Analyst (text-to-SQL) and custom tools / MCP.
       Snowflake now recommends Cortex Agents over calling Cortex Analyst directly.
   * - **CoWork** (formerly *Snowflake Intelligence*)
     - Chat assistant for business users to ask questions of their data and act on it.
   * - **CoCo** (formerly *Cortex Code*)
     - AI coding assistant for SQL, Python, dbt in Snowflake.
   * - **AI governance**
     - Cortex AI Gateway, guardrails, observability/tracing, cost governance.

.. code-block:: sql

   -- Classify and filter reviews with LLMs, in plain SQL
   SELECT
     review_id,
     AI_CLASSIFY(review_text, ['delivery', 'product', 'price', 'support']):labels[0] AS topic,
     AI_SENTIMENT(review_text) AS sentiment
   FROM reviews
   WHERE AI_FILTER(PROMPT('Is this customer asking for a refund? {0}', review_text));

   -- Free-form generation
   SELECT AI_COMPLETE('llama3.1-70b', 'Summarise in one line: ' || ticket_body)
   FROM support_tickets LIMIT 10;

.. note::

   Function names, available models and preview/GA status change often — always check the
   `release notes <https://docs.snowflake.com/en/release-notes/new-features>`_. See also
   :doc:`whats_new`.


Cost tips
---------

- ``AUTO_SUSPEND`` low (60 s) and ``AUTO_RESUME`` on every warehouse.
- One warehouse **per workload** (ETL, BI, DS) so you can size and monitor them separately.
- **Resource monitors** and budgets to cap credit usage.
- Cluster keys only on very large tables with selective filters.
- Watch AI function costs (billed per token) — test on ``LIMIT 100`` first.


Certifications
--------------

- **SnowPro Associate: Platform** — entry level.
- **SnowPro Core** — the foundation certification.
- **SnowPro Advanced** — Architect, Data Engineer, Administrator, Data Scientist, Data Analyst.
- **SnowPro Specialty** — e.g. Snowpark, Native Apps, Gen AI.

Check the current list on the learning portal below.


Useful links
------------

- Courses / certifications: https://learn.snowflake.com/courses/
- Documentation: https://docs.snowflake.com/
- Release notes: https://docs.snowflake.com/en/release-notes/new-features
- Community: https://community.snowflake.com/
- Free trial (30 days): https://signup.snowflake.com/
