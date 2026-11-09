
PROJECT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PROJECT_NAME = central_bank
PACKAGE_NAME = central_bank
PYTHON_INTERPRETER = python3
PYTHON_VERSION = 3.12
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = ./docs
BUILDDIR      = ./docs/_build


# echo colors
ccend = $(shell tput sgr0)
ccbold = $(shell tput bold)
ccgreen = $(shell tput setaf 2)
ccred = $(shell tput setaf 1)
ccso = $(shell tput smso)


ifeq (,$(shell which conda))
HAS_CONDA = False
else
HAS_CONDA = True
endif

ifeq (,$(shell which pyenv))
HAS_PYENV = False
else
HAS_PYENV = True
endif

ifeq (,$(shell which poetry))
HAS_POETRY = False
else
HAS_POETRY = True
endif


req-install:
	@echo "$(ccso) --> Install Python Dependencies (DEV)$(ccend)"
	$(PYTHON_INTERPRETER) -m pip install uv
	$(PYTHON_INTERPRETER) -m uv pip install -U pip setuptools wheel
	$(PYTHON_INTERPRETER) -m uv pip install --upgrade pip
	$(PYTHON_INTERPRETER) -m uv pip install -r requirements.txt


conda_env:
	@echo "$(ccso)--> Set up python interpreter environment (conda)$(ccend)"
ifeq (True,$(HAS_CONDA))
	@echo ">>> Detected conda, creating conda environment."
ifeq (3,$(findstring 3,$(PYTHON_INTERPRETER)))
	conda create --name $(PACKAGE_NAME) python=3
else
	conda create --name $(PACKAGE_NAME) python=2.7
endif
	@echo ">>> New conda env created. Activate with:\nsource activate $(PACKAGE_NAME)"
else
	@echo ">>> No virtualenv packages installed. Please install one above first"
endif

## Set up python interpreter environment (pyenv)
pyenv_env:
	@echo "$(ccso)--> Set up python interpreter environment (pyenv)$(ccend)"
ifeq (True,$(HAS_PYENV))
	@echo ">>> Detected pyenv, creating pyenv environment."
	pyenv virtualenv $(PYTHON_VERSION) $(PACKAGE_NAME)
	@echo ">>> New pyenv created. Activate with: pyenv activate $(PACKAGE_NAME)"
	pyenv local $(PACKAGE_NAME) 
	@echo ">>> By default, the pyenv is activated in the local folder"
else
	@echo ">>> No virtualenv packages installed. Please install one above first"
endif

## Delete pyenv environment
delete_pyenv_env:
	@echo "$(ccso)--> Delete pyenv environment$(ccend)"
	ifeq (True,$(HAS_PYENV))
		pyenv virtualenv-delete $(PACKAGE_NAME)
	else
		@echo ">>> No pyenv virtualenv packages installed. Please install one above first"
	endif


###############################################


## Delete all compiled _build/ folder
clean:
	@echo "$(ccso)--> Delete all compile python files $(ccend)"
	find . -type f -name "*.py[co]" -delete
	find . -type d -name "__pycache__" -delete
	@echo "Delete _build directory"
	rm -r "$(BUILDDIR)"

## Automatically generate HTML documentation
livehtml:
	sphinx-autobuild "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O) --port=8001


deployhtml:
	sphinx-build -b html "$(SOURCEDIR)" _build/html

## Build the embeddings index for the in-browser "Ask the docs" bot (needs Node 20+)
searchindex:
	npm ci --prefix scripts --no-fund --no-audit
	node scripts/embed-index.mjs _build/html



#################################################################################
# UTILITIES                                                                 #
#################################################################################

## Auto-generate the rst file for the Sphinx documentation
generate_docs:
	@echo "$(ccso)--> Generate the RST file for the Sphinx documentation$(ccend)"
	sphinx-apidoc -o ./docs src/
	@echo "RST files are available at: ./docs/"

# Create the .env-template from .env
create-env-template: $(ENV_FILE)
	@echo "$(ccso)--> Create the template file $(TEMPLATE_FILE) from $(ENV_FILE)$(ccend)"
	@awk -F'=' '{print $$1"=\"\""}' $(ENV_FILE) > $(TEMPLATE_FILE)
	@echo "Fichier $(TEMPLATE_FILE) créé avec succès"

# Help command to list all available targets
help:
	@echo "Available targets:"
	@echo "  help          - Show this help message"

# Default target
.PHONY: all build up down restart logs logs-% backend-shell frontend-shell mongo-shell clean help