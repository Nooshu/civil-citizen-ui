# Scripts and commands (agents)

Prefer **Yarn 4** scripts from `package.json`. Do not block a single wait on long jobs (`yarn test:coverage`, large installs); background them and poll — `AGENTS.md` Long-running commands.

Run `nvm use` first so Node matches `.nvmrc` (`>=24.18.0`).

## Everyday development

| Command | What it does | Notes |
| --- | --- | --- |
| `yarn install` | Install with `yarn.lock` | Immutable by default; checksums must match (`checksumBehavior: throw`). Use `YARN_ENABLE_IMMUTABLE_INSTALLS=false` only when the lockfile is meant to change. Age gate: `npmMinimalAgeGate` 7 days on resolve |
| `yarn deps:check` | Exact pins in `package.json` + SHA checksums in `yarn.lock` | `bin/check-dependency-pins.mjs`. Also runs in `cichecks` and GitHub `ci.yml` (every PR; required before Renovate automerge) |
| `yarn deps:audit` | `yarn npm audit --recursive` vs `yarn-audit-known-issues` | Production tree must be empty of advisories. `bin/check-yarn-audit.mjs`. Also in `cichecks` and `ci.yml` |
| `yarn start:dev` | Redis (`compose/draft-store.yml`) + nodemon + `NODE_ENV=development` | **https://localhost:3001**, self-signed TLS. Needs IDAM/civil-service URLs in config |
| `yarn start:redis` | Docker Redis on `6379` | |
| `yarn start` | `ts-node` `src/main/server.ts`; `NODE_ENV` defaults to production | HTTP, not HTTPS |
| `yarn start:e2e` | `NODE_ENV=e2eTest` | Fake session, in-memory Redis, no OIDC |
| `yarn preview` / `yarn start:ui-preview` | `bin/ui-preview.sh` | **http://localhost:3001/ui-preview**. Frees 3001/1111, rebuilds in Docker. Fixture user `someID`; claims `1645882162449409` / `9601` full admit by instalments / `9602` part admit by instalments / `9603` case progression / `9604` GA |
| `yarn start:ui-preview:down` | Stop preview compose | |
| `yarn startwin` / `yarn startwin:dev` | Windows variants | |
| `yarn build` | webpack → `src/main/public/` | Required after SCSS/JS/entry changes |
| `yarn build:prod` | Production webpack | Used in `Dockerfile` |
| `yarn webpack` | Same pipeline as build (README still mentions this) | Prefer `yarn build` |
| `yarn lint` | stylelint `**/*.scss` + ESLint 10 `eslint.config.mjs` | |
| `yarn lint:win` | `eslint.config.win.mjs` | CRLF |
| `yarn lint --fix` | ESLint auto-fix | |

`nodemon.json` watches `src/main` (`ts,js,njk,css`) and runs `bin/generate-ssl-options.sh && ts-node src/main/server.ts`.

`postinstall` runs `./bin/pull-latest-civil-shared.sh || true` — missing `bin/shared/` is OK until CCD helpers are needed.

## Jest (always `--no-sparkplug`)

All Jest npm scripts already pass `node --no-sparkplug ./node_modules/jest/bin/jest.js`. Keep that.

| Command | Config / roots | Use |
| --- | --- | --- |
| `yarn test` | `jest.config.js`, `src/test/unit`, maxWorkers 75%, silent, `LOG_LEVEL=OFF` | Default unit |
| `yarn test:coverage` | same + coverage of all `src/main` TS/JS, **maxWorkers=8**, global `coverageThreshold` | After dependency bumps; Sonar `coverage/lcov.info` |
| `yarn test:govuk-fixtures` | `src/test/unit/govukFrontend/govukFrontendFixtures.test.ts` | After GOV.UK / Nunjucks env changes — must pass |
| `yarn test:routes` / `yarn test:integration` | `jest.functionaltest.config.js`, `src/integration-test`, `--runInBand` | Middleware/route wiring |
| `yarn test:pact` | `jest.pact.config.js` | Consumer contracts |
| `yarn pact:publish` | `src/test/contract/publish/publish.ts` | Needs broker env |
| Focused file | `yarn test -- src/test/unit/path/to/file.test.ts` | Fast loop; also the SIGSEGV recovery path |

Setup files: `jest.setup.redis-mock.js` (ioredis-mock + LaunchDarkly mock), `jest.setup.js` (nock, retryTimes 2).

## Accessibility

| Command | Reality |
| --- | --- |
| `yarn test:a11y` | Alias of `yarn tests:a11y` |
| `yarn tests:a11y` | Pa11y/Mocha `src/test/a11y/a11y.mock-test.ts` |
| `yarn tests:a11y:parallel` | `src/test/a11y/run-parallel-a11y-tests.sh` (Jenkins CNP) |

## CodeceptJS functional

Needs secrets / stack. Config: `codecept.conf.js`. Tests: `src/test/functionalTests/tests/`.

| Command | Tag / helper |
| --- | --- |
| `yarn test:functional` | `run-functional-tests.sh` |
| `yarn test:fullfunctional` | Full helper; `yarn test:e2e` is a deprecated alias |
| `yarn test:civil-citizen-pr` | `@civil-citizen-pr` |
| `yarn test:civil-citizen-master` | `@civil-citizen-master` |
| `yarn test:civil-citizen-nightly` | `@civil-citizen-nightly` |
| `yarn test:payments` | `@ui-payments` |
| `yarn testgalip:e2e` | Deprecated name; greps `@ui-ga` |
| `yarn test:debug` | `@debug` |
| `yarn test:crossbrowser` / `test:crossbrowser-functional` | Sauce Labs |
| `yarn test:mocked-functional` | `bin/run-mocked-functional-tests.sh` — e2eTest + chart WireMock + in-memory Redis + `@reduced-stack` (compat `@mocked-functional`) |
| `yarn test:mocked-functional:browser` | CodeceptJS only (stack already up); greps `@reduced-stack` |
| `yarn test:smoke` | `bin/run-smoke-tests.sh` |

Chromium for mocked functional: `yarn playwright install chromium` once. Logs: `${TMPDIR:-/tmp}/civil-citizen-ui-mocked-functional`.

## WireMock

| Command | Path / effect |
| --- | --- |
| `yarn wiremock:validate` | `bin/validate-wiremock-mappings.js` — **chart** mappings; forbids broad matchers |
| `yarn test:wiremock-contracts` | `bin/test-wiremock-contracts.sh` |
| `yarn wiremock:pull` | `bin/pull-latest-wiremock-mappings.sh` → repo-root `wiremock/` (gitignored except chart) |
| `yarn wiremock:start` | pull + WireMock on **1111** |

Chart contracts: `charts/civil-citizen-ui/wiremock/`. Preview stubs: `compose/ui-preview-mappings/`. **Never mix.**

## README / Confluence table generators

Do not hand-edit the giant tables in `README.md`. Scripts live under `src/test/e2e-documentation/`:

- `yarn test:generate:e2e-ui-data` / `e2e-api-data`
- `yarn test:readme:e2e-ui-table` / `e2e-api-table`
- `yarn test:generate:ft-groups-ui-data` / `ft-groups-api-data`
- `yarn test:readme:ft-groups-*-table`
- `yarn test:confluence:*` — needs `CONFLUENCE_PERSONAL_ACCESS_TOKEN`, `CONFLUENCE_BASE_URL`, `CONFLUENCE_PAGE_ID`

GitHub workflows on `master` can auto-commit README refreshes.

## CI aggregate

`yarn cichecks` = install + **deps:check** + **deps:audit** + build + lint + wiremock validate + wiremock contracts + coverage + routes. Accessibility is **not** included (use `yarn tests:a11y`; Jenkins runs `tests:a11y:parallel`). Windows: `yarn cichecks:win` (no wiremock steps).

GitHub `.github/workflows/ci.yml` always runs deps:check + deps:audit + build. **Renovate PRs** additionally run `yarn test:coverage`. Config: `.github/renovate.json` (`rangeStrategy: pin`, `automerge-minor`).

`yarn sonar-scan` — needs scanner credentials.

## `bin/` (pipeline and local helpers)

| Script | Role |
| --- | --- |
| `bin/ui-preview.sh` | UI Preview compose |
| `bin/generate-ssl-options.sh` | Local HTTPS certs (`src/main/resources/localhost-ssl`, gitignored) |
| `bin/pull-latest-civil-shared.sh` | Sparse-checkout helpers into `bin/shared/` from civil-service |
| `bin/validate-wiremock-mappings.js` | Reduced-stack contract quality |
| `bin/check-dependency-pins.mjs` | Exact `package.json` pins + `yarn.lock` SHA checksums (`yarn deps:check`) |
| `bin/check-yarn-audit.mjs` | `yarn npm audit` vs `yarn-audit-known-issues`; production tree must be clean (`yarn deps:audit`) |
| `bin/test-wiremock-contracts.sh` | Contract tests against chart mappings |
| `bin/run-mocked-functional-tests.sh` | Local reduced-stack CodeceptJS |
| `bin/run-preview-playwright-tests.sh` | Playwright against preview |
| `bin/run-smoke-tests.sh` | Smoke |
| `bin/assert-preview-wiremock.sh` | Preview WireMock sanity |
| `bin/import-ccd-definition.sh` / `import-ga-ccd-definition.sh` | CCD import (uses `bin/shared/`) |
| `bin/import-bpmn-diagram.sh` / `import-dmn-diagram.sh` / `import-wa-bpmn-diagram.sh` | Camunda / DMN / WA |
| `bin/pull-latest-camunda-files.sh` / `pull-latest-dmn-files.sh` / `pull-latest-camunda-wa-files.sh` | Fetch definition artefacts |
| `bin/pull-latest-release-asset.sh` | Generic release asset pull |
| `bin/pull-latest-wiremock-mappings.sh` | Root `wiremock/` from civil-wiremock-mappings |
| `bin/setup-devuser-preview-env.sh` | Dev-user preview env |
| `bin/init.sh` | Init helper |
| `bin/variables/load-*-environment-variables.sh` | aat / preview / staging / dev-user-preview |

`bin/shared/*` is **pulled**, not owned (except `.gitkeep`). Do not patch those files here; change civil-service or the pull script.

## Docker

| Command | Notes |
| --- | --- |
| `docker-compose build` / `up` | Root `docker-compose.yml` — app image, port 3001 |
| `Dockerfile` | `hmctsprod.azurecr.io/base/node:24-alpine`, `yarn build:prod` |
| `Dockerfile.ui-preview` | Preview image |

## Playwright (security)

Specs: `playwright/tests/api-security/`. Needs a running CUI. Config: `playwright.config.ts` (if present) + `playwright/tsconfig.json` for the editor only.

## When you are stuck on env

- Health: `https://localhost:3001/health` (dev) or `http://localhost:3001/health` (preview/prod-style)
- Ports in the way: 3001 (app), 1111 (WireMock), 6379 (Redis)
- Preview without IDAM is the right tool for Nunjucks/visual work
