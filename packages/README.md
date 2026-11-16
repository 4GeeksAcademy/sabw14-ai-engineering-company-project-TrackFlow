# `packages` folder

This folder contains **shared packages** for the monorepo: internal libraries, utilities, types, shared components, SDKs, clients, and any code reused by multiple applications, agents, or pipelines.

Each subfolder under `packages/` should represent **one versionable package** (for example `shared-types`, `ui`, `analytics-sdk`) with its own README.

- **Main purpose**: encourage reuse and consistency across all company deliverables.
- **Recommendation**: document packages as you add them—their public API and how they are consumed from `apps/`, `agents/`, and `workflows/`.

> _Spanish version: [README.es.md](./README.es.md)._

## Packages

| Package | What it is | Commands (from its folder) |
|---|---|---|
| [`domain/`](./domain) · `@trackflow/domain` | Milestone 2 domain logic: models, collections, search, shipping cost and carrier scoring, reports, validations | `corepack pnpm install && corepack pnpm run check` |
| `shared/` · `@repo/shared-types` | Template shared types | — |
