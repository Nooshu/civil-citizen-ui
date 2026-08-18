# Hard prohibitions (agents)

Do not do these unless the user explicitly overrides in the same conversation.

## Stack

- Do not introduce NestJS, Prisma, React, Vue, Angular, or a second template engine. His Majesty’s Courts and Tribunals Service (HMCTS) citizen apps are Express server-side rendering (SSR) ([service-assessment.md](service-assessment.md)).
- Do not add generative AI as the user journey or an unexplained decision engine (Service Standard points 2, 6, 11, 14).
- Do not invent a second HTTP client stack. Use `src/main/app/client/`.
- Do not invent a new database. Redis draft store + session only (`src/main/modules/draft-store/`, `getRedisStoreForSession()`).
- Do not add npm as the package manager or delete `yarn.lock`.
- Do not add `^`, `~`, or other version ranges to `package.json` dependencies, devDependencies, or resolutions.
- Do not extend HMCTS Renovate `automerge-all` or let Renovate write version ranges (`rangeStrategy` must stay `pin`; majors and `govuk-frontend` must not automerge).
- Do not “modernise” `tsconfig.json` (`strict: false`, `ignoreDeprecations: "6.0"`, `moduleResolution: node`, `baseUrl`, `types: ["*"]`) without an explicit request — those keep TypeScript 6 compiling this codebase.

## GOV.UK Frontend and UI

- Do not hand-write GOV.UK component HTML (`govuk-button`, `govuk-error-summary`, `govuk-header`, `govuk-table`, `govuk-inset-text`, footer, skip link, breadcrumbs) when a Nunjucks macro exists.
- Do not edit `node_modules/govuk-frontend` or vendor-copied GOV.UK JS/CSS.
- Do not rebuild GOV.UK component markup in client JavaScript; show/hide or populate **macro-rendered** DOM.
- Do not fork GOV.UK CSS; theme in `src/main/assets/scss/` only.
- Do not rewrite GOV.UK output to silence axe. Disable the scanner rule if the conflict is inherent to the Design System.
- Do not duplicate shared journey chrome across templates; extract a partial under `src/main/views/`.

## WireMock and preview

- Do not copy `compose/ui-preview-mappings/` into `charts/civil-citizen-ui/wiremock/mappings`.
- Do not loosen chart mapping matchers to make UI Preview work. Preview stubs are a separate set.
- Do not combine GitHub labels `pr-values:reducedStack` and `pr-values:fullDeployment` in advice.

## Security, personally identifiable information (PII), secrets

- Do not log names, addresses, emails, DOB, phones, claim amounts, fees, payments, interest, repayment figures, or wholesale case/party objects.
- Do not commit `.env`, Key Vault values, Identity and Access Management (IDAM)/service-to-service (S2S)/Redis/Ordnance Survey (OS)/LaunchDarkly secrets.
- Do not add `unsafe-inline` to Content Security Policy (CSP). Extend Helmet allowlists + nonces if you add a third-party script.
- Do not skip Cross-Site Request Forgery (CSRF) on new POST routes without a documented exception (today: eligibility, first-contact, testing-support).

## Tests and Node 24

- Do not remove `--no-sparkplug` from Jest npm scripts.
- Do not put V8 flags in `NODE_OPTIONS` (Node rejects them).
- Do not treat a SIGSEGV that then passes on a solo re-run as a product bug.
- Do not use `yarn cichecks` as proof that accessibility ran — Pa11y is `yarn tests:a11y` (Jenkins: `yarn tests:a11y:parallel`).
- Do not re-run full `yarn test:coverage` after a SIGSEGV-only failure that passed in isolation.

## Git and identity

- Do not invent JIRA / ticket ids.
- Do not attach AI coding-agent identity to commits or pushes.
- Do not amend commits you did not just create, or that have been pushed, unless the user asked and the amend rules in the user git protocol are met.
- Do not force-push `master`.

## Config and Redis

- Do not scatter new `process.env` reads; use `node-config` (`config.get`) and map env in `config/custom-environment-variables.yaml`.
- Do not change Redis TTL categories or key shapes without calling it out (performance/ops). Helpers: `ttlConfig.ts`, `redisWriteHelper.ts`.
- Do not bump `connect-redis` to a major that drops ioredis without a coordinated session-store migration.

## Generated / pulled trees

- Do not treat as source of truth: `node_modules/`, `coverage/`, `src/main/public/` (webpack output), `bin/shared/` (pulled from civil-service), `wiremock/` at repo root (pulled), `src/test/contract/pacts/` (generated), `functional-output/`, `test-results/`.
- Do not hand-edit the huge generated functional-test tables in `README.md` unless you intend to run the generator scripts.
