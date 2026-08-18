# Standing conventions (index)

Canonical source: [`AGENTS.md`](../AGENTS.md) (symlink `AGENT.md`). This page is an index only — do not fork a second instruction set here, and do not add editor-specific rule packs.

If this folder disagrees with `AGENTS.md`, **`AGENTS.md` wins**. Fix this page in the same change.

## Topics → `AGENTS.md`

| Topic | Section in `AGENTS.md` |
| --- | --- |
| Sync `hmcts` before application changes; package-only origin push | Before changing code; Package-only updates |
| Exact pins, 7-day cooldown, `yarn.lock`, full `yarn test:coverage` after dep bumps, SIGSEGV isolation | Dependencies |
| Long coverage/install waits — background and poll | Long-running commands |
| Express/TS under `src/main/`; no Nest/Prisma/SPA; existing HTTP clients and draft-store | Server / application stack |
| GOV.UK macros only; app JS/SCSS only; axe does not override GOV.UK; reuse Nunjucks partials | GOV.UK Frontend |
| After `govuk-frontend` bumps: build, fixtures, unit, a11y, spot-check | GOV.UK Frontend (upgrade checklist) |
| Frontend performance, API/Redis cost, accessible UI | Performance and accessibility |
| Fix TS/Jest compile errors in the same change | Testing and coverage |
| Human `docs/` + this `ai-docs/` tree; TSDoc (no `{Type}` braces) | Documentation and code comments; Keep `ai-docs/` in sync |
| No agent co-author / author on git history | Git and commits |
| No guessed ticket keys | Git and commits |

Procedures (not standing rules): [playbooks/add-a-screen.md](playbooks/add-a-screen.md), [playbooks/dependency-bump.md](playbooks/dependency-bump.md), [playbooks/govuk-frontend-upgrade.md](playbooks/govuk-frontend-upgrade.md).

Human pairing: [`docs/contributing.md`](../docs/contributing.md), [`docs/testing.md`](../docs/testing.md), [`docs/frontend.md`](../docs/frontend.md).

## Useful one-liners

```bash
# focused unit test
yarn test -- src/test/unit/routes/features/<journey>/<file>.test.ts

# GOV.UK HTML accuracy
yarn test:govuk-fixtures

# chart WireMock
yarn wiremock:validate && yarn test:wiremock-contracts

# lint
yarn lint
```
