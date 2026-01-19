.PHONY: all build test lint format check clean install help
.PHONY: jj-status jj-log jj-diff jj-commit jj-new jj-push jj-fetch jj-undo jj-branches

# =============================================================================
# Development
# =============================================================================

all: format lint test build ## Run format, lint, test, and build

install: ## Install dependencies
	npm install

build: ## Build the action
	npm run build

test: ## Run tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

check: ## Check formatting without modifying files
	npm run format:check

clean: ## Clean build artifacts
	rm -rf dist node_modules

# =============================================================================
# jj (Jujutsu) Operations
# =============================================================================

jj-status: ## Show jj status
	jj status

jj-log: ## Show jj log
	jj log

jj-diff: ## Show jj diff
	jj diff

jj-commit: ## Create a new commit (usage: make jj-commit m="message")
	jj commit -m "$(m)"

jj-describe: ## Describe current revision (usage: make jj-describe m="message")
	jj describe -m "$(m)"

jj-new: ## Create a new empty revision
	jj new

jj-squash: ## Squash current changes into parent
	jj squash

jj-fetch: ## Fetch from remote
	jj git fetch

jj-push: ## Push to remote
	jj git push

jj-push-branch: ## Push specific branch (usage: make jj-push-branch b="branch-name")
	jj git push --branch $(b)

jj-branches: ## List all branches
	jj branch list

jj-branch-create: ## Create a branch (usage: make jj-branch-create b="branch-name")
	jj branch create $(b)

jj-branch-set: ## Set branch to current revision (usage: make jj-branch-set b="branch-name")
	jj branch set $(b)

jj-undo: ## Undo last operation
	jj undo

jj-op-log: ## Show operation log
	jj op log

# =============================================================================
# Help
# =============================================================================

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
