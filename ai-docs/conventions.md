# Standing conventions (index)

Canonical source: [`AGENTS.md`](../AGENTS.md) (symlink `AGENT.md`). This page is an index only — do not fork a second instruction set here, and do not add editor-specific rule packs.

If this folder disagrees with `AGENTS.md`, **`AGENTS.md` wins**. Fix this page in the same change.

## Topics → `AGENTS.md`

| Topic | Section in `AGENTS.md` |
| --- | --- |
| Sync `hmcts` before application changes; package-only origin push | Before changing code; Package-only updates |
| Exact pins (all deps/resolutions), lockfile SHA (Secure Hash Algorithm) checksums, 7-day `npmMinimalAgeGate`, Renovate `rangeStrategy: pin` + `automerge-minor`, `yarn deps:check`, `yarn deps:audit`, full `yarn test:coverage` after dep bumps, segmentation violation (SIGSEGV) isolation | Dependencies |
| Nest `@jest/reporters/glob` at CommonJS `7.2.3`; do not blanket-pin glob 13 (ESM, breaks `CoverageReporter`) | Testing and coverage; [`docs/testing.md`](../docs/testing.md) |
| Service Standard, Technology Code of Practice (TCoP), His Majesty’s Courts and Tribunals Service (HMCTS) citizen stack, Design System, Web Content Accessibility Guidelines (WCAG) 2.2 AA | Service assessment (GOV.UK / HMCTS); [`docs/service-assessment.md`](../docs/service-assessment.md) |
| Long coverage/install waits — background and poll | Long-running commands |
| Express/TS under `src/main/`; no Nest/Prisma/Single Page Application (SPA); existing HTTP clients and draft-store | Server / application stack |
| GOV.UK macros only; app JS/SCSS only; axe does not override GOV.UK; reuse Nunjucks partials | GOV.UK Frontend |
| Do not re-add `@ministryofjustice/frontend` / `jquery`; Add another is `add-another.js` (`initAddAnother` also starts `initAppendRow`) | GOV.UK Frontend; [`docs/moj-frontend.md`](../docs/moj-frontend.md) |
| After `govuk-frontend` bumps: build, fixtures, unit, a11y, spot-check | GOV.UK Frontend (upgrade checklist) |
| Frontend performance, API/Redis cost, accessible UI | Performance and accessibility |
| Fix TS/Jest compile errors in the same change | Testing and coverage |
| Human `docs/` + this `ai-docs/` tree; TSDoc (no `{Type}` braces) | Documentation and code comments; Keep `ai-docs/` in sync |
| No agent co-author / author on git history | Git and commits |
| No guessed ticket keys | Git and commits |
| Preview HTTP 200 with empty/`£NaN`/`Invalid DateTime`/`Created []` — seed CCD/Redis or add a production fallback; do not fake copy in Nunjucks | Runtime (UI Preview missing data); [playbooks/ui-preview-missing-data.md](playbooks/ui-preview-missing-data.md) |

Procedures (not standing rules): [playbooks/add-a-screen.md](playbooks/add-a-screen.md), [playbooks/ui-preview-missing-data.md](playbooks/ui-preview-missing-data.md), [playbooks/dependency-bump.md](playbooks/dependency-bump.md), [playbooks/govuk-frontend-upgrade.md](playbooks/govuk-frontend-upgrade.md), [playbooks/moj-frontend.md](playbooks/moj-frontend.md). [playbooks/moj-frontend-v10-upgrade.md](playbooks/moj-frontend-v10-upgrade.md) is a historical stub.

Human pairing: [`docs/contributing.md`](../docs/contributing.md), [`docs/testing.md`](../docs/testing.md), [`docs/frontend.md`](../docs/frontend.md), [`docs/service-assessment.md`](../docs/service-assessment.md), [`docs/glossary.md`](../docs/glossary.md).

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

# exact pins + yarn.lock SHA checksums
yarn deps:check

# yarn npm audit vs yarn-audit-known-issues (production tree must be clean)
yarn deps:audit
```
