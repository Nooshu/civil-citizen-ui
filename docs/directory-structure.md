# Directory structure

This is a map of the repository as it exists on `master`. Paths are relative to the repo root.

## Top level

| Path | Purpose |
| --- | --- |
| `src/main/` | Application code (Express server, routes, views, assets) |
| `src/test/` | Unit, a11y, contract, functional, and documentation generators |
| `config/` | `node-config` YAML (defaults + env overlays) |
| `webpack/` + `webpack.config.js` | Frontend asset pipeline |
| `charts/civil-citizen-ui/` | Helm chart, values templates, packaged WireMock mappings |
| `compose/` | Local Docker Compose (Redis draft store, UI Preview) |
| `bin/` | Shell helpers: CCD/Camunda import, WireMock, preview, shared civil-service scripts |
| `docs/` | This documentation |
| `playwright/` | Playwright security specs |
| `infrastructure/` | Supporting infra scripts (if present for the pipeline) |
| `.github/workflows/` | GitHub Actions (CI lint/build, stale bots, README table refresh) |
| `Jenkinsfile_CNP` / `Jenkinsfile_nightly` | Main and nightly pipelines |
| `AGENTS.md` | Agent coding rules (`AGENT.md` is a symlink) |
| `.cursor/rules/` | Canonical Cursor rules |
| `catalog-info.yaml` | Backstage component |
| `docker-compose.yml` / `Dockerfile` | Container build for CUI |
| `Dockerfile.ui-preview` | Image used by UI Preview |

Generated or local-only directories you should not commit as source of truth: `node_modules/`, `coverage/`, `functional-output/`, `src/main/public/` (webpack output), `bin/shared/` (pulled from civil-service).

## `src/main/`

```text
src/main/
├── server.ts              Node HTTP(S) listener
├── app-instance.ts        express() singleton
├── app.ts                 middleware + route wiring
├── development.ts         webpack-dev-middleware when NODE_ENV=development
├── index.js               webpack JS/SCSS entry (GOV.UK initAll)
├── HttpError.ts
├── app/                   auth + HTTP clients
├── common/                forms, models, validators, logging
├── modules/               OIDC, Nunjucks, Helmet, Redis, i18n, health
├── routes/                controllers, guards, urls.ts, routes.ts
├── services/              business logic and CCD translators
├── views/                 Nunjucks
├── assets/js|scss         app JS/SCSS (not vendor GOV.UK)
├── public/                webpack output (served as static files)
└── resources/             localhost TLS certs
```

### `src/main/routes/features/`

Feature folders match user journeys:

`claim`, `response`, `claimantResponse`, `dashboard`, `caseProgression`, `directionsQuestionnaire`, `mediation`, `generalApplication`, `queryManagement`, `judgmentOnline`, `settlementAgreement`, `document`, `helpWithFees`, `claimAssignment`, `contact`, `public`, `uiPreview`.

### `src/main/services/`

- `features/` — one folder per journey (mirrors routes)
- `translation/` — CUI ↔ CCD converters (`convertToCUI`, `convertToCCD` under claim/response/GA/…)
- `dashboard/`, `caseDocuments/`, `firstcontact/`, `genericForm/`

### `src/main/app/client/`

| File | Backend |
| --- | --- |
| `civilServiceClient.ts` | civil-service (claims, fees, events, dashboard scenarios) |
| `civilServiceUrls.ts` | Path templates |
| `gaServiceClient.ts` / `gaServiceUrls.ts` | General applications |
| `dmStoreClient.ts` | Document management |
| `serviceAuthProviderClient.ts` | S2S tokens |
| `legacyDraftStoreClient.ts` | Legacy CMC draft-store API (still configured) |
| `pcq/` | PCQ id/token/client |

### `src/main/modules/`

| Module | Role |
| --- | --- |
| `oidc/` | Login, callback, logout, public-path allowlist |
| `nunjucks/` | View engine, filters, GOV.UK / MoJ search paths |
| `helmet/` | CSP and related headers |
| `csrf/` | `@dr.pogodin/csurf` except eligibility, first-contact, testing-support |
| `draft-store/` | ioredis client, TTLs, payment session keys, Redis seed data |
| `e2eConfiguration/` | In-memory stores for `e2eTest` |
| `i18n/` | i18next + filesystem backend (`locales/en.json`, `cy.json`) |
| `health/` | `@hmcts/nodejs-healthcheck` |
| `appinsights/` | Application Insights |
| `properties-volume/` | Azure Key Vault / properties volume |
| `cookie/` | Cookie banner config (also a webpack entry) |
| `security/` | e.g. `restrictFormContentType` |
| `ordance-survey-key/` | OS Places API key wiring |

## `src/test/`

| Path | Runner |
| --- | --- |
| `unit/` | Jest (`jest.config.js`) — default `yarn test` |
| `a11y/` | Pa11y via Mocha (`yarn tests:a11y`) |
| `contract/` | Pact (`jest.pact.config.js`) |
| `functionalTests/` | CodeceptJS (`codecept.conf.js`) |
| `e2e-documentation/` | Generators that refresh README / Confluence tables |
| `utils/` | Shared mocks and claim fixtures |

Route integration tests use `jest.functionaltest.config.js` (`yarn test:routes` / `yarn test:integration`).

## `config/`

See [Configuration](configuration.md). Files: `default.yaml`, `development.yaml`, `dev.yaml`, `test.yaml`, `production.yaml`, `custom-environment-variables.yaml`.

## `charts/civil-citizen-ui/`

- `Chart.yaml` — depends on HMCTS `nodejs`, optional `wiremock`, `civil-service`, `servicebus`, `wa`
- `values.yaml` and environment templates (`values.preview.template.yaml`, `values.fullDeployment.preview.template.yaml`, `values.reducedStack.preview.template.yaml`, `values.aat.template.yaml`)
- `wiremock/` — **validated reduced-stack contracts** (not UI Preview stubs)

## `compose/`

- `draft-store.yml` — Redis `6379` for `yarn start:redis`
- `ui-preview.yml` — CUI + WireMock for `yarn preview`
- `ui-preview-mappings/` — preview-only stubs (broader matchers; **must not** be copied into the chart mappings)

## `bin/`

Notable scripts:

- `pull-latest-civil-shared.sh` — also run from `postinstall`
- `ui-preview.sh` — `yarn preview`
- `validate-wiremock-mappings.js` / `test-wiremock-contracts.sh`
- `run-mocked-functional-tests.sh`
- CCD/Camunda/DMN import helpers used in preview pipelines

## `playwright/`

Security-oriented API tests under `playwright/tests/api-security`. Editor TypeScript config is `playwright/tsconfig.json` (`noEmit`, `types: ["node"]` so Jest globals do not clash with `@playwright/test`).
