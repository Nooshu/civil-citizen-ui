# Playbook: add a citizen screen

Use this instead of inventing a parallel stack. Aligns with [`docs/citizen-journeys.md`](../../docs/citizen-journeys.md) “Pattern for a new screen”.

## 1. URL

Add a constant to `src/main/routes/urls.ts`. Reuse `/case/:id/…` or `/claim/…` prefixes. Do not hard-code path strings in controllers.

## 2. Controller

Create `src/main/routes/features/<journey>/<name>Controller.ts`:

- `GET`: load claim via existing helpers (`getClaimById` / draft store), build view model in a **service**, `res.render`.
- `POST`: class-validator form → service → redirect.
- Thin controller only.

Register: import and invoke in `src/main/routes/routes.ts`.

## 3. Guard / auth / CSRF

- Journey prefix guard? Wire in `src/main/app.ts` if it applies to many URLs.
- Unauthenticated? Extend `modules/oidc/index.ts` allowlist.
- POST? Include CSRF unless the path is already in the csrf skip list (do not add skips lightly).
- Uploads? `uploadRateLimitGuard` + `restrictFormContentType`.

## 4. Service + models

- Logic in `src/main/services/features/<journey>/`.
- CCD mapping in `src/main/services/translation/`, not in the controller.
- Form class in `src/main/common/form/`.

## 5. Nunjucks

- `src/main/views/features/<journey>/….njk`
- Extend `layout.njk`
- GOV.UK macros only for components (`govukButton`, `govukInput`, `govukErrorSummary`, …) — Service Standard 4/13; see [`docs/service-assessment.md`](../../docs/service-assessment.md)
- Reuse `views/macro/` and claim-details templates
- CSRF include on POST forms
- Client JS must bind to **macro-rendered** markup (`src/main/assets/js/`). Repeatable rows: one init (`initAddAnother` from `index.js`) and two markup contracts — `cui-add-another*` plus `.cui-add-another__items` (client clone) or `.row-container` / `.append-row` (`initAppendRow`). Do not add `@ministryofjustice/frontend` ([`docs/moj-frontend.md`](../../docs/moj-frontend.md)).

## 6. i18n

Keys in `src/main/modules/i18n/locales/en.json` **and** `cy.json`. Use `t('…')`. No hard-coded user sentences in TS.

## 7. Tests

- Service unit test without `{app}` when possible
- Route unit test with supertest if HTTP behaviour matters
- Integration test if middleware/session is involved
- Functional CodeceptJS only if the journey is user-visible in preview/AAT (HMCTS acceptance environment) and neighbours already cover it
- Pa11y: capture HTML under `src/test/utils/mocks/a11y/` and **do not** add the URL to `ignored-urls.ts` if that mock exists. Scanner-vs-GOV.UK conflicts go in `pa11y-options.ts`
- If the screen is on `/ui-preview`, seed WireMock + Redis so the GET is useful (not empty/`£NaN`) — [playbooks/ui-preview-missing-data.md](ui-preview-missing-data.md)

## 8. Verify

```bash
yarn lint
yarn test -- src/test/unit/routes/features/<journey>/
yarn test -- src/test/unit/services/features/<journey>/
# if webpack/JS/SCSS:
yarn build
```

Server TS compile errors: fix in the same change.

## 9. Docs

Update human `docs/citizen-journeys.md` if a new journey area. Update this `ai-docs` playbook only if the pattern itself changed. Catalogue GETs: add `page()` in `pageCatalog.ts` and follow [ui-preview-missing-data.md](ui-preview-missing-data.md).
