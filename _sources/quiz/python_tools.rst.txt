
Quiz · Python Tooling
=====================

Revise first with :doc:`/python/uv_learn`, :doc:`/python/uv_cli`, :doc:`/python/numba` and
:doc:`/python/decouple`.

.. qcm:: Which command creates a new uv project already structured as an installable package?
   :explanation: ``uv init --package`` creates a ``src/`` layout with a package and a ``pyproject.toml``.

   - [ ] ``uv new my_pkg``
   - [x] ``uv init --package my_pkg``
   - [ ] ``uv create --lib my_pkg``
   - [ ] ``uv venv my_pkg``

.. qcm:: How do you add ``pytest`` only as a **development** dependency with uv?
   :explanation: Dependency groups keep dev tools out of the runtime dependencies.

   - [ ] ``uv pip install pytest``
   - [ ] ``uv add pytest --global``
   - [x] ``uv add --group dev pytest``
   - [ ] ``uv tool install pytest``

.. qcm:: What does ``uv sync`` do?
   :explanation: It makes the virtual environment match the lockfile (``uv.lock``), installing/removing packages as needed.

   - [ ] Pushes your code to GitHub
   - [x] Installs exactly the dependencies from the project's lockfile into the virtual environment
   - [ ] Upgrades Python to the latest version
   - [ ] Deletes the virtual environment

.. qcm:: Which file guarantees reproducible installs across machines in a uv project?
   :explanation: ``uv.lock`` pins exact versions of every (transitive) dependency.

   - [ ] ``requirements.in``
   - [ ] ``setup.cfg``
   - [x] ``uv.lock``
   - [ ] ``.python-version``

.. qcm:: You want to run a script once with ``loguru`` available, without adding it to the project. What do you use?
   :explanation: ``uv run --with <pkg>`` adds a package for that run only.

   - [x] ``uv run --with loguru script.py``
   - [ ] ``uv add loguru && uv remove loguru``
   - [ ] ``pip install loguru --temp``
   - [ ] ``uv sync --with loguru``

.. qcm:: What is **Numba**?
   :explanation: Numba compiles Python functions to machine code at runtime (JIT) using LLVM — great for numeric loops.

   - [ ] A dataframe library
   - [x] A just-in-time (JIT) compiler for Python based on LLVM
   - [ ] A Python package manager
   - [ ] A GPU-only deep-learning framework

.. qcm:: Since pandas 2.2, how can ``DataFrame.apply`` be accelerated with Numba?
   :explanation: Pass ``engine="numba"`` (optionally with ``raw=True`` and ``engine_kwargs={"parallel": True}``).

   - [ ] ``df.apply(f, fast=True)``
   - [x] ``df.apply(f, engine="numba", raw=True)``
   - [ ] ``df.numba_apply(f)``
   - [ ] It is not possible

.. qcm:: With python-decouple, how do you read ``DEBUG`` from ``.env`` as a boolean with a default?
   :explanation: ``config`` reads from env vars / ``.env`` / ``settings.ini`` and ``cast`` converts the string value.

   - [ ] ``os.environ["DEBUG"] == True``
   - [x] ``config("DEBUG", default=False, cast=bool)``
   - [ ] ``decouple.bool("DEBUG")``
   - [ ] ``config.get_bool("DEBUG")``
