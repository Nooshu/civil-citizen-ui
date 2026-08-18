# Testing

## Landscape

| Layer | Tool | Command | Needs running app? |
| --- | --- | --- | --- |
| Unit | Jest | `yarn test` | No |
| Unit + coverage | Jest | `yarn test:coverage` | No |
| GOV.UK HTML fixtures | Jest | `yarn test:govuk-fixtures` | No |
| Route integration | Jest + Supertest | `yarn test:integration` | In-process `app` |
| Pact | Jest | `yarn test:pact` | No (consumer) |
| Accessibility | Pa11y / Mocha | `yarn tests:a11y` | Yes (or mocked a11y helper) |
| Functional UI/API | CodeceptJS | `yarn test:functional` / groups | Preview/AAT stack |
| Mocked functional | CodeceptJS + WireMock | `yarn test:mocked-functional` | Local e2eTest + WireMock |
| Cross-browser | CodeceptJS + Sauce Labs | `yarn test:crossbrowser` | Sauce + env |
| Playwright security | Playwright | specs in `playwright/tests/` | Running CUI |
| Smoke | `bin/run-smoke-tests.sh` | `yarn test:smoke` | Deployed env |

`yarn test:a11y` is a **stub** that prints that a11y is enforced in GitHub Actions. The real local command is `yarn tests:a11y`. The Service Standard bar is **WCAG 2.2 AA**; Pa11y is the scanner HMCTS documents, but do not treat a green Pa11y run as a full audit. See [service-assessment.md](service-assessment.md).

## Unit tests (Jest)

- Root: `src/test/unit/`
- Config: `jest.config.js` (`testEnvironment: 'node'`)
- Setup: `jest.setup.redis-mock.js` (ioredis-mock + LaunchDarkly mock), `jest.setup.js` (`nock`, `retryTimes(2)`)
- Path aliases match `tsconfig.json` (`common/`, `models/`, `services/`, …)
- ESM-only packages (`uuid`, `jsdom` internals, …) are listed in `transformIgnorePatterns` so babel-jest can transpile them

Most **route** tests import `{app}` from `src/main/app` and use supertest. That boots Express, Nunjucks, and Redis mocks — suites can take several seconds under coverage. **Service** tests should mock `draftStoreService` and avoid importing `app` when they do not need HTTP.

Coverage: `yarn test:coverage` uses `--maxWorkers=8` (memory). Jest reports coverage for files exercised by the unit suite. Sonar reads `coverage/lcov.info` (`sonar-project.properties`).

### Node 24 / SIGSEGV

All Jest npm scripts use `node --no-sparkplug ./node_modules/jest/bin/jest.js`. Sparkplug plus Jest’s `vm` module can crash a worker (`ClearStaleLeftTrimmedPointerVisitor`, nodejs/node#62393). If coverage dies with `signal=SIGSEGV`, re-run **only** the failed file. If it passes, do not re-run the full suite.

## GOV.UK fixtures

Compares official macros rendered through CUI’s Nunjucks to `govuk-frontend` `fixtures.json`. Must stay green after Frontend upgrades.

## Integration / routes

`jest.functionaltest.config.js`, `yarn test:routes`. These are still Jest tests (not CodeceptJS) and run in CI via `cichecks`.

## Pact

`jest.pact.config.js`, contracts under `src/test/contract/`. Publish with `yarn pact:publish` when your environment is set up for the broker. Reduced-stack create-claim interactions are noted in the WireMock inventory doc.

## Functional tests (CodeceptJS)

Config: `codecept.conf.js`. Tests: `src/test/functionalTests/tests/` (ui_tests, api helpers, mocked).

Tags drive pipelines, for example:

- `@civil-citizen-pr` — PR pipeline (`yarn test:civil-citizen-pr`)
- `@civil-citizen-master`
- `@civil-citizen-nightly`
- Feature groups: `@ui-ga`, `@ui-payments`, `@ui-hearings`, `@mocked-functional`, …

Scripts:

- `yarn test:functional` → `run-functional-tests.sh`
- `yarn test:fullfunctional` → full suite helper (legacy `yarn test:e2e` aliases this)
- `yarn test:payments` — `@ui-payments`

Diagnostics published by Jenkins: [functional-test-diagnostics.md](functional-test-diagnostics.md).

### Mocked / reduced-stack

```bash
yarn playwright install chromium   # once
yarn test:mocked-functional
```

Starts CUI in `e2eTest`, WireMock with **chart** mappings, in-memory Redis, then CodeceptJS `@mocked-functional`. Logs: `${TMPDIR:-/tmp}/civil-citizen-ui-mocked-functional`.

Authoritative CI: GitHub label `pr-values:reducedStack` (do not combine with `pr-values:fullDeployment`).

## Playwright

`playwright/tests/api-security` plus `playwright.config.ts`. Separate tsconfig so `@playwright/test` types do not clash with Jest.

## Generating README / Confluence tables

From `src/test/e2e-documentation/`:

| Yarn script | Output |
| --- | --- |
| `test:generate:e2e-ui-data` / `e2e-api-data` | JSON under `src/test/e2e-documentation/results/` |
| `test:readme:e2e-ui-table` / `e2e-api-table` | Regenerates tables in README.md |
| `test:generate:ft-groups-*-data` + `test:readme:ft-groups-*-table` | Functional group tables |
| `test:confluence:*` | Needs `CONFLUENCE_PERSONAL_ACCESS_TOKEN`, `CONFLUENCE_BASE_URL`, `CONFLUENCE_PAGE_ID` |

GitHub workflows on `master` can auto-commit README table refreshes (`stefanzweifel/git-auto-commit-action`).

## What to run before a PR

Minimum for application code:

```bash
yarn lint
yarn test          # or yarn test:coverage for dependency/sonar-sensitive changes
```

Also run when relevant:

- `yarn test:govuk-fixtures` after GOV.UK or Nunjucks/macro changes
- `yarn test:integration` after middleware/route wiring changes
- `yarn wiremock:validate` and `yarn test:wiremock-contracts` after chart mappings change
- `yarn build` after webpack, SCSS, or client JS changes

Server TypeScript changes should not be left with `tsc` / Jest transform errors (`AGENTS.md` Testing and coverage).
