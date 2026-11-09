
AI Agents
=========

:Version: 2026-11

.. admonition:: Definition
   :class: important

   An **AI agent** is an LLM that runs **in a loop**, decides **which tools to call**,
   observes the results, and keeps going until the goal is reached.

   **Agent = Model + Instructions + Tools + Memory + Loop**


Chatbot vs workflow vs agent
----------------------------

.. list-table::
   :header-rows: 1
   :widths: 18 41 41

   * -
     - Who decides the next step?
     - Example
   * - Chatbot
     - Nobody — one question, one answer.
     - "Summarise this email."
   * - Workflow
     - **Your code** (fixed path, LLM inside some steps).
     - Extract invoice → validate → write to DB.
   * - Agent
     - **The model** (dynamic path).
     - "Find why yesterday's revenue dropped and draft a report."

.. tip::

   Start with the simplest thing that works. Most business problems are solved by a
   single call or a workflow. Use an agent when the steps **can't be known in advance**
   and mistakes can be caught (tests, review, rollback).


The agent loop
--------------

.. mermaid::

   flowchart LR
       U([User goal]) --> M{LLM decides}
       M -- tool call --> T[Run tool<br/>SQL · API · search · code]
       T -- observation --> M
       M -- final answer --> A([Answer / action])

This is often called **ReAct** (*Reason + Act*): think → act → observe → repeat.


Building blocks
---------------

**1. Tools (function calling)**
   You describe each tool with a name, a description and a JSON schema. The model answers
   with a *tool call* (name + arguments); **your code** executes it and sends the result back.
   Good tool descriptions matter as much as good prompts.

**2. Memory**
   - *Short-term*: the conversation and tool results in the context window.
   - *Long-term*: facts saved outside the model (files, database, vector store) and
     retrieved later.
   - Long sessions need *context management*: summarise/compact or clear old tool results.

**3. Planning**
   Breaking the goal into steps, sometimes written as an explicit to-do list the agent updates.

**4. Environment & permissions**
   What the agent can touch (sandbox, files, APIs) and which actions need human approval.


Minimal tool-use loop (Python)
------------------------------

Example with the Anthropic SDK (``pip install anthropic``). Every provider follows the
same pattern: *send tools → model requests a call → you execute → send the result back*.

.. code-block:: python

   import json
   import anthropic

   client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

   tools = [{
       "name": "get_revenue",
       "description": "Return total revenue in EUR for a given day (YYYY-MM-DD).",
       "input_schema": {
           "type": "object",
           "properties": {"day": {"type": "string"}},
           "required": ["day"],
       },
   }]

   def get_revenue(day: str) -> dict:
       return {"day": day, "revenue_eur": 125_400}  # call your warehouse here

   messages = [{"role": "user", "content": "Compare revenue of 2026-11-07 and 2026-11-08."}]

   while True:
       response = client.messages.create(
           model="claude-opus-5-5", max_tokens=16000, tools=tools, messages=messages,
       )
       if response.stop_reason != "tool_use":
           break
       # keep the assistant turn (including its tool calls) in the history
       messages.append({"role": "assistant", "content": response.content})
       # run every requested tool, return ALL results in ONE user message
       results = []
       for block in response.content:
           if block.type == "tool_use":
               output = get_revenue(**block.input)
               results.append({
                   "type": "tool_result",
                   "tool_use_id": block.id,
                   "content": json.dumps(output),
               })
       messages.append({"role": "user", "content": results})

   print(next(b.text for b in response.content if b.type == "text"))

.. note::

   SDKs also ship helpers that run this loop for you (e.g. Anthropic's *tool runner*), and
   agent SDKs/frameworks (below) add built-in tools, memory and tracing.


Protocols: MCP & A2A
--------------------

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * -
     - **MCP** — Model Context Protocol
     - **A2A** — Agent2Agent protocol
   * - Purpose
     - Connect an agent to **tools and data** (agent ↔ tool).
     - Let **agents talk to other agents** (agent ↔ agent).
   * - Origin
     - Anthropic (Nov 2024), now an open standard under the Linux Foundation's
       Agentic AI Foundation.
     - Google (Apr 2025), now a Linux Foundation project.
   * - Concepts
     - *Host* (app) → *client* → *server* exposing **tools**, **resources**, **prompts**.
       Transports: stdio (local) or streamable HTTP (remote).
     - *Agent card* (capabilities), *tasks*, *messages*, *artifacts*.
   * - Analogy
     - "USB-C for AI tools"
     - "HTTP between agents"

Write one MCP server for your API and every MCP-compatible client (Claude, ChatGPT,
IDEs, Snowflake/Databricks agents…) can use it.


Frameworks & SDKs
-----------------

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Framework
     - Sweet spot
   * - **LangGraph**
     - Stateful graphs with explicit control flow, checkpoints, human-in-the-loop.
   * - **CrewAI**
     - Role-based multi-agent "crews"; quick to prototype.
   * - **LlamaIndex**
     - Data/RAG-heavy agents, document workflows.
   * - **Pydantic AI**
     - Type-safe Python agents with validated outputs.
   * - **Claude Agent SDK**
     - The Claude Code harness as a library: file, shell and web tools, subagents, MCP.
   * - **OpenAI Agents SDK**
     - Lightweight agents with handoffs and guardrails.
   * - **Google ADK**
     - Agent Development Kit, integrates with Vertex AI and A2A.
   * - **Microsoft Agent Framework**
     - Successor of AutoGen + Semantic Kernel for .NET / Python.
   * - **smolagents** (Hugging Face)
     - Minimal "code agents" that write Python to act.

**Inside data platforms:** Snowflake **Cortex Agents** (see :doc:`/data/snowflake`) and
Databricks **Agent Bricks** (see :doc:`/data/databricks`) let you build agents next to your
governed data.


Tool design tips
----------------

- Few, **well-named** tools beat many overlapping ones.
- Write descriptions as if for a new colleague: what it does, when to use it, input format.
- Return **concise, meaningful** output (not 10 MB of JSON). Paginate.
- Return clear **errors** the model can recover from ("unknown column ``revnue`` — did you mean ``revenue``?").
- Make dangerous tools require **confirmation**; prefer read-only by default.

Continue with :doc:`agentic`.
