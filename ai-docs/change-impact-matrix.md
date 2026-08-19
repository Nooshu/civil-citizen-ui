# Change-impact matrix

Use this as a checklist. Paths are from the repo root.

## New or changed citizen page

Must usually touch all of:

| Layer | Where |
| --- | --- |
| URL constant | `src/main/routes/urls.ts` |
| Controller | `src/main/routes/features/<journey>/…Controller.ts` |
| Registration | import + invoke in `src/main/routes/routes.ts` |
| Guard (if gated) | `src/main/routes/guards/` and wire in `src/main/app.ts` if it is a path-prefix guard |
| Service | `src/main/services/features/<journey>/` |
| Form | `src/main/common/form/models/` + validators |
| View | `src/main/views/features/<journey>/….njk` — GOV.UK macros, `{% include %}` CSRF, extend `layout.njk` |
| i18n | `src/main/modules/i18n/locales/en.json` **and** `cy.json` |
| Unit test | `src/test/unit/routes/features/<journey>/` and/or `src/test/unit/services/features/<journey>/` |
| Optional functional | `src/test/functionalTests/` with an existing tag |

OIDC: if the page must work logged-out (eligibility, first-contact, static legal, payment return, UI preview), extend the allowlist in `src/main/modules/oidc/index.ts`. CSRF skip is **not** the same list (csrf module).

## CCD / civil-service contract change

1. `src/main/app/client/civilServiceClient.ts` and/or `civilServiceUrls.ts` (GA: `gaServiceClient.ts` / `gaServiceUrls.ts`)
2. Translator: `src/main/services/translation/` (`convertToCUI*` load, `convertToCCD*` submit)
3. Domain types: `src/main/common/models/` (and `ccdResponse/` / `ccdGeneralApplication/` if CCD-shaped)
4. Unit tests under `src/test/unit/services/translation/` and `src/test/unit/app/client/`
5. Pact if the interaction is already a consumer: `src/test/contract/consumers/`
6. Chart WireMock **only** if the call is in the reduced-stack **create-claim** set: `charts/civil-citizen-ui/wiremock/` then `yarn wiremock:validate`

Do not “fix” preview by editing chart mappings; use `compose/ui-preview-mappings/`. Empty or `£NaN` preview pages: seed both WireMock and `uiPreviewRedisData.json` when both stores are read; see [playbooks/ui-preview-missing-data.md](playbooks/ui-preview-missing-data.md).

## UI Preview fixtures

| Change | Also |
| --- | --- |
| New catalogue GET | Walk template interpolations; seed CCD/Redis; add `page()` in `pageCatalog.ts`; confirm HTML not only status 200 |
| WireMock mapping JSON only | `docker compose -f compose/ui-preview.yml restart wiremock` (bind-mounted) |
| `uiPreviewRedisData.json` / TypeScript / Nunjucks | Rebuild `citizen-ui` |
| Query management list | `queries.caseMessages` on `GET /cases/1645882162449603`; `createdBy` `someID` |

## Redis / draft store

| Change | Also |
| --- | --- |
| New draft key or TTL category | `ttlConfig.ts`, `config/default.yaml` (+ env map), `docs/configuration.md`, this matrix, PR summary (perf/ops) |
| Read/write helpers | Prefer `draftStoreService.ts` / `redisWriteHelper.ts`; avoid extra get/set of the same key in one request |
| Session cookie / store | `app.ts` + `modules/utilityService` `getRedisStoreForSession` — not ioredis drafts |
| e2eTest fixtures | `modules/e2eConfiguration/` and `redisData.json` / `gaRedisData.json` / `uiPreviewRedisData.json` |

## GOV.UK Frontend or Nunjucks env

- `package.json` pin + lockfile
- `yarn build`
- `yarn test:govuk-fixtures` **must pass**
- Version notes in `AGENTS.md`, `docs/frontend.md`, `docs/project-overview.md`
- Do not patch `node_modules/govuk-frontend`
- App JS/SCSS overrides only

## Client JavaScript / SCSS

- JS: `src/main/assets/js/` and import from `src/main/index.js` if it must ship in `main`
- Cookie bundle is a **second** webpack entry: `modules/cookie/cookieConfig.ts`
- SCSS: `src/main/assets/scss/main.scss` (+ small override files)
- `yarn build`; unit tests under `src/test/unit/assets/js/` when behaviour is asserted
- Do not construct GOV.UK component HTML in JS

## Auth / Helmet / CSRF / rate limit

| Area | Files | Tests |
| --- | --- | --- |
| OIDC | `modules/oidc/`, `app/auth/user/oidc` | `src/test/unit/modules/oidc/` |
| Helmet/CSP | `modules/helmet/` | `src/test/unit/modules/helmet/` — third-party scripts need nonce + CSP |
| CSRF | `modules/csrf/` | eligibility/first-contact/testing-support skips |
| Upload rate limit | `uploadRateLimitGuard.ts`, config `uploadRateLimit` | Off in `config/test.yaml` |
| PII logs | `common/logging/piiRedaction`, `server.ts` installs **first** | `.semgrep/`, `docs/pii-logging-check.md` |

## Feature flags

`src/main/app/auth/launchdarkly/launchDarklyClient.ts`. e2eTest uses TestData + `TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT`. YAML `featureToggles.*` is separate (e.g. settlement agreement). Prefer LaunchDarkly for case-scoped behaviour.

## Config / Helm / env

1. Default in `config/default.yaml`
2. Env map in `config/custom-environment-variables.yaml`
3. Helm `charts/civil-citizen-ui/values*.yaml` if the platform must inject it
4. `docs/configuration.md` + `ai-docs/directory-mirror/config.md`

`dev.yaml` and `production.yaml` may be empty — `NODE_ENV=development` loads `development.yaml`, not `dev.yaml`.

## Tests only

Mirror production layout: `src/test/unit/<same path after src/main>/`. Route tests that import `app` are slow; keep them for HTTP behaviour, not business-rule unit tests.

## Dependencies

Exact pins for **all** direct deps and resolutions. 7-day cooldown unless security (`npmMinimalAgeGate` / `YARN_NPM_MINIMAL_AGE_GATE=0`). Then `yarn deps:check`, `yarn deps:audit`, and **one** `yarn test:coverage`. SIGSEGV → re-run that file only. Package-**only** changes may follow the origin auto-push rule in `AGENTS.md`.

Renovate (`.github/renovate.json`) must keep `rangeStrategy: pin` and must not extend `automerge-all`. Changing that file without `deps:check` + coverage on `renovate/*` PRs re-opens ranged automerges.

Known blocked majors (do not “just bump”): `config` v5 (ESM, huge blast), `connect-redis` v10 (ioredis), `@ministryofjustice/frontend` v10, Babel 8 + Jest 30 coupled. See `docs/dependency-update-log-2026-08-18.md`.

## Infrastructure / charts

`infrastructure/` and `charts/` CODEOWNERS include `@hmcts/civil-admins` for some paths. Prefer not to drive Terraform from a UI-only task. Chart WireMock mappings are owned by `@hmcts/civil`.
