# `src/test/` — unit, functional, a11y, Pact, generators

Human overview: [`docs/testing.md`](../../docs/testing.md).

## `unit/` — default `yarn test`

Mirrors `src/main/` (`app/`, `assets/`, `common/`, `modules/`, `routes/`, `services/`) plus:

- `govukFrontend/` — `yarn test:govuk-fixtures` (must stay green)
- `assets/js/add-another.test.ts` — clone / remove / mediation no-op after MoJ removal (do not lower `coverageThreshold` instead)
- `functionalTests/diagnostics/` — unit tests for functional diagnostic helpers

Setup: `jest.setup.redis-mock.js`, `jest.setup.js`. Environment `node`.

**Prefer service tests without `{app}`.** Route tests that import `app` boot Express + Nunjucks and dominate coverage time.

## `a11y/`

Pa11y. Real command: `yarn tests:a11y` (alias `yarn test:a11y`). HTML fixtures under `src/test/utils/mocks/a11y/` (claim `1645882162449409`; currently **360** HTML files). Scans **every** `urls.ts` citizen GET that has a matching mock. `ignored-urls.ts` is no-view / external / hash-fragment / missing-mock / developer-only only — do not ignore a mocked page because HTML_CodeSniffer or axe disagrees with GOV.UK macros (`pa11y-options.ts` instead). Guard: `src/test/unit/a11y/ignoredUrlsMocks.test.ts`. A green mock run is not a WCAG 2.2 AA audit. Not part of `yarn cichecks`; Jenkins runs `tests:a11y:parallel`.

## `contract/` — Pact

Consumers: civil-service create-claim + fee payment, IDAM OIDC, S2S. Generated pacts under `pacts/` are gitignored. `yarn test:pact`. Publish: `yarn pact:publish`.

## `functionalTests/` — CodeceptJS

| Path | Role |
| --- | --- |
| `tests/ui_tests/` | Browser journeys (tags `@civil-citizen-pr`, `@ui-ga`, `@ui-payments`, …) |
| `tests/api_tests/` | API-level functional |
| `tests/mocked/` | `@reduced-stack` (compat `@mocked-functional`) for reduced-stack create-claim |
| `citizenFeatures/`, `lrFeatures/`, `caseworkerFeatures/` | Page objects / steps |
| `specClaimHelpers/` | CCD/API helpers, fixtures, IDAM, case roles |
| `helpers/`, `plugins/` | Playwright helper, failed-file plugin |
| `diagnostics/` | Failure summaries for Jenkins |
| `run-functional-tests.sh`, `run-full-functional-tests.sh`, `saucelabs.conf.js` | Runners |

Config: repo-root `codecept.conf.js`. Env: `.env.tests.local` (gitignored). Teardown unassigns users and deletes IDAM test users — do not skip teardown when adding workers.

Authoritative reduced-stack CI is the Jenkins preview label, not only `yarn test:mocked-functional`.

## `e2e-documentation/`

Generators for README / Confluence tables. Output `results/` is gitignored. Do not hand-edit those README tables.

## `utils/mocks/`

Shared claim JSON (`civilClaimResponseMock.json`, etc.) and a11y HTML. Reuse before creating a new 2k-line fixture.

## `crossbrowser/`

Sauce Labs helpers.

## `types/`

Test-only typings.

## SIGSEGV

If a worker dies with SIGSEGV, re-run **that file**. If green, stop. Keep `--no-sparkplug` on Jest scripts.
