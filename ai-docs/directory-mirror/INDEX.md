# Directory mirror — index

Artificial Intelligence (AI)-oriented notes for each area of the tree. Human map: [`docs/directory-structure.md`](../../docs/directory-structure.md). Acronyms: [`docs/glossary.md`](../../docs/glossary.md).

## How to use

1. Find the directory you will edit.
2. Read that page **before** searching blindly — it lists invariants, paired tests, and scripts.
3. If you add a new top-level directory, add a row here in the same change. Keeping this tree current is **mandatory** on every project change (`AGENTS.md` — Keep `ai-docs/` in sync).

## Application

| Path | AI notes |
| --- | --- |
| [`src/`](src.md) | Three trees: `main` (app), `test` (Jest/Codecept/Pact/accessibility (a11y)), `integration-test` |
| [`src/main/`](src-main.md) | Express process: `server.ts` → `app.ts` → routes |
| [`src/main/app/`](src-main-app.md) | HTTP clients + LaunchDarkly + OpenID Connect (OIDC) user helpers |
| [`src/main/common/`](src-main-common.md) | Forms, domain models, personally identifiable information (PII) logging, utils |
| [`src/main/modules/`](src-main-modules.md) | Cross-cutting Express modules (OIDC, Nunjucks, Redis, Helmet, internationalisation (i18n)) |
| [`src/main/routes/`](src-main-routes.md) | Controllers, `urls.ts`, `routes.ts`, guards |
| [`src/main/services/`](src-main-services.md) | Business logic + CCD translators |
| [`src/main/views/`](src-main-views.md) | Nunjucks layouts, macros, journey templates |
| [`src/main/assets/`](src-main-assets.md) | App JS + SCSS only (not vendor GOV.UK) |
| [`src/test/`](src-test.md) | Unit, functional, a11y, Pact, README generators |
| [`src/integration-test/`](src-integration-test.md) | Jest + Supertest route integration |

## Runtime, config, front-end pipeline

| Path | AI notes |
| --- | --- |
| [`config/`](config.md) | node-config YAML + env mapping |
| [`webpack/`](webpack.md) + `webpack.config.js` | Asset pipeline → `src/main/public/` (generated) |
| [Root files](root-files.md) | `package.json`, tsconfig, Jest, ESLint, Docker, Jenkinsfiles, `KEYCHANGES.md` |

## Deploy, local stacks, helpers

| Path | AI notes |
| --- | --- |
| [`charts/`](charts-compose-bin.md#charts) | Helm + **validated** WireMock contracts |
| [`compose/`](charts-compose-bin.md#compose) | Redis + UI Preview (preview stubs ≠ chart contracts). Empty 200s: [playbooks/ui-preview-missing-data.md](../playbooks/ui-preview-missing-data.md) |
| [`bin/`](charts-compose-bin.md#bin) | Shell helpers; `bin/shared/` is pulled |
| [`infrastructure/`](infrastructure.md) | Terraform (Key Vault, Redis, App Insights) |
| [`playwright/`](playwright.md) | API security specs |
| [`.github/`, Jenkins, `.semgrep/`](github-ci.md) | CI, PII scan; agent conventions live in `AGENTS.md` |
| [Generated / gitignored](generated-and-ignored.md) | Do not treat as source |

## Journey folder names (keep them aligned)

When adding a feature, use the **same** folder name under routes, services, views, and unit tests:

`claim`, `response`, `claimantResponse`, `dashboard`, `caseProgression`, `directionsQuestionnaire`, `mediation`, `generalApplication`, `queryManagement`, `judgmentOnline`, `settlementAgreement`, `document`, `helpWithFees`, `claimAssignment`, `contact`, `public`, `uiPreview` (views: `ui-preview`).
