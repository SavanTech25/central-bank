
Quiz · Data Platforms
=====================

Revise first with :doc:`/data/snowflake`, :doc:`/data/databricks`, :doc:`/data/comparison`
and :doc:`/data/whats_new`.

.. qcm:: In Snowflake, what is a **virtual warehouse**?
   :explanation: A virtual warehouse is a compute cluster. Storage is separate, so several warehouses can query the same data.

   - [ ] A database where tables are stored
   - [x] A compute cluster that runs queries, sized and billed independently
   - [ ] A data-sharing contract
   - [ ] A backup of your data

.. qcm:: Which Snowflake feature lets you query a table **as it was 10 minutes ago**?
   :explanation: Time Travel, e.g. ``SELECT * FROM t AT (OFFSET => -600)``.

   - [ ] Zero-copy cloning
   - [ ] Snowpipe
   - [x] Time Travel
   - [ ] Dynamic Tables

.. qcm:: You want a Snowflake table that is automatically kept fresh from a ``SELECT`` with a target freshness. What do you use?
   :explanation: Dynamic Tables are declarative: define the query and ``TARGET_LAG``, Snowflake handles the refreshes.

   - [ ] A stream
   - [x] A Dynamic Table
   - [ ] A secure view
   - [ ] A stage

.. qcm:: Which Snowflake SQL function keeps only the rows matching a natural-language condition?
   :explanation: ``AI_FILTER`` returns a boolean from an LLM, so it can be used in ``WHERE`` clauses.

   - [ ] ``AI_COMPLETE``
   - [ ] ``AI_AGG``
   - [x] ``AI_FILTER``
   - [ ] ``AI_TRANSLATE``

.. qcm:: What is **Delta Lake**?
   :explanation: Delta Lake is an open table format on top of Parquet adding ACID transactions, time travel, MERGE and schema enforcement.

   - [ ] Databricks' proprietary SQL engine
   - [x] An open table format adding ACID transactions and time travel to Parquet files
   - [ ] A streaming service
   - [ ] A vector database

.. qcm:: In Databricks, what does **Unity Catalog** provide?
   :explanation: Unity Catalog is the governance layer: three-level namespace, permissions, lineage, audit — for tables, files, models and AI assets.

   - [ ] Spark cluster autoscaling
   - [ ] A notebook editor
   - [x] Centralised governance: permissions, lineage and a ``catalog.schema.table`` namespace
   - [ ] A BI dashboard tool

.. qcm:: In the medallion architecture, which layer holds **cleaned and conformed** data?
   :explanation: Bronze = raw, Silver = cleaned/conformed, Gold = business aggregates.

   - [ ] Bronze
   - [x] Silver
   - [ ] Gold
   - [ ] Platinum

.. qcm:: What is **Lakebase** on Databricks?
   :explanation: Lakebase is serverless Postgres in the Databricks platform (from the Neon acquisition), used for apps and agent state such as Agent Bricks memory.

   - [ ] A new name for Delta Lake
   - [x] A serverless Postgres database integrated with the lakehouse
   - [ ] A data marketplace
   - [ ] A GPU cluster type

.. qcm:: At Snowflake Summit 2026, what did **Snowflake Intelligence** become?
   :explanation: Snowflake Intelligence was renamed CoWork (for knowledge workers) and Cortex Code became CoCo (for developers).

   - [ ] Cortex Search
   - [ ] Openflow
   - [x] CoWork
   - [ ] Snowpark

.. qcm:: A team of Python/Spark engineers needs large-scale streaming and custom ML on open formats in their own storage. Which platform is usually the more natural fit?
   :explanation: Both can do it, but Databricks' Spark/ML DNA and open storage model fit this profile best. SQL-first, low-ops teams often lean Snowflake.

   - [ ] Snowflake
   - [x] Databricks
   - [ ] Neither can do this
   - [ ] Only a self-hosted Hadoop cluster
