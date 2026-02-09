---
description: Map an existing codebase using GSD methodology
---
// turbo-all
# GSD: Map Codebase Workflow

This workflow analyzes an existing codebase and produces structured documentation in `.planning/codebase/`.

## 1. Initialize Context
1. Run the GSD initialization tool to gather project state.
```bash
node rules/get-shit-done/bin/gsd-tools.cjs init map-codebase
```

## 2. Check for Existing Maps
1. Check if `.planning/codebase/` already exists.
2. If it exists, ask the user whether to **Refresh**, **Update**, or **Skip**.

## 3. Create Structure
1. Create the necessary directory:
```bash
mkdir -p .planning/codebase
```

## 4. Analyze and Generate Documents
Perform deep analysis of the codebase and create the following documents in `.planning/codebase/`:

- **STACK.md**: Analyze `package.json`, environment files, and imports. List languages, frameworks, runtime, and all major dependencies with versions and rationale.
- **INTEGRATIONS.md**: Identify external APIs, databases, auth providers, and webhooks.
- **ARCHITECTURE.md**: Document the high-level design patterns (e.g., MVC, Hexagonal), layers, data flow, and main entry points.
- **STRUCTURE.md**: Map the directory layout, key file locations, and naming conventions.
- **CONVENTIONS.md**: Document coding style, linting rules, error handling patterns, and common naming schemes found in the code.
- **TESTING.md**: Identify test frameworks, directory structure, mocking strategies, and current coverage status.
- **CONCERNS.md**: Highlight technical debt, known bugs, security risks, and fragile areas of the code.

## 5. Security Scan (CRITICAL)
1. Scan the generated documents for accidentally leaked secrets (API keys, tokens, etc.).
```bash
grep -E '(sk-[a-zA-Z0-9]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9_-]+|AKIA[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]+|-----BEGIN.*PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.)' .planning/codebase/*.md
```
2. If secrets are found, alert the user and do NOT commit.

## 6. Commit Results
1. Commit the mapping documents to the repository.
```bash
node rules/get-shit-done/bin/gsd-tools.cjs commit "docs: map existing codebase" --files .planning/codebase/*.md
```

## 7. Next Steps
1. Inform the user that mapping is complete.
2. Recommend running `/gsd-new-project` to start the planning phase.
