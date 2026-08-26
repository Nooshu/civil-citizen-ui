# `src/main/modules/` — Express cross-cutting

Each folder is typically a class or `enable(app)` style module constructed from `app.ts`. Keep new cross-cutting behaviour here, not in controllers.

| Module | Role | Agent traps |
| --- | --- | --- |
| `oidc/` | Login `/login`, callback `/oauth2/callback`, logout, public-path allowlist | Payment confirmation URLs, eligibility, first-contact, legal pages, UI preview, documents download, assign-claim, claim-issue task list have special cases. Update allowlist if a new unauthenticated GET/POST must work. |
| `nunjucks/` | View engine, filters, search paths (`views/`, `govuk-frontend/dist` only) | After changing filters or paths, `yarn test:govuk-fixtures` if macros/env changed. `toGovukTaskListItems` / `toDashboardGovukTaskListItems` feed `govukTaskList`. Do not add Ministry of Justice (MoJ) Frontend to the search path. Handover: [`docs/moj-frontend.md`](../../docs/moj-frontend.md). |
| `helmet/` | Content Security Policy (CSP) + Helmet | New third-party script = nonce + CSP directives. No `unsafe-inline`. `referrerPolicy` must exist in config. |
| `csrf/` | `@dr.pogodin/csurf` (Cross-Site Request Forgery, CSRF) | Skips `/eligibility*`, `/first-contact*`, testing-support. Off when `NODE_ENV === 'test'`. Views need CSRF token (`views/macro/csrf.njk` / `res.locals.csrf`). |
| `draft-store/` | **ioredis** draft client, time to live (TTL), payment session keys, general application (GA)/Help with Fees (HWF) drafts, Redis seed | Keys are often claimId or claimId+userId. `saveDraftClaim` / `getDraftClaimFromStore`. TTL days in config. `redisData.json` seeds non-production. |
| `e2eConfiguration/` | In-memory Redis + fixtures for `e2eTest` | `redisData.json`, `gaRedisData.json`, `uiPreviewRedisData.json` — mocked functional + UI Preview extra claims. Admit claims used on claimant-response must include `case_data.claimantResponse`. **How they want to pay** needs the defendant’s INSTALMENTS `repaymentPlan`. **Your payment plan** (`/claimant-response/payment-plan`) reads `claimantResponse.suggestedPaymentIntention.repaymentPlan` (`paymentAmount`, `repaymentFrequency`, `firstRepaymentDate`) — an empty `{}` leaves the length as a blank schedule until the user types. **Court offered set date** (`/claimant-response/court-offered-set-date`) reads `fullAdmission`/`partialAdmission.paymentIntention.paymentDate` — without it the page interpolates a blank (and used to show Luxon `Invalid DateTime`). UI Preview also seeds `1645882162449605` (part admit + statement of means; Redis `alreadyPaid: no` and £400 — WireMock CCD must keep `specDefenceAdmittedRequired: No` or a CCD overwrite 500s the how-much guard) and sets case progression `1645882162449603` to `FAST_CLAIM` so trial-arrangement guards pass, with claimant trial arrangements, hearing duration, a Help with Fees reference, request-for-reconsideration text, `respondent1ResponseDate`, a DEFENDANT_DEFENCE document for **View the response to the claim**, and ten `queries.caseMessages` parent threads for **Messages to the court**. Claim `1645882162449604` includes a `generalApplication` draft (strike out, hearing contact, COSC payment date, `applicationFee.calculatedAmountInPence` `10800`). Grow the `/ui-preview` catalogue by seeding these stores (or a production-safe fallback) for GETs that 500 or look empty — not by adding links toward a count, and not by faking copy in Nunjucks. |
| `i18n/` | internationalisation (i18next) + `locales/en.json`, `cy.json` | User-visible strings: both languages. Query `lang` + cookie. Flag `enableWelshForMainCase`. |
| `health/` | `@hmcts/nodejs-healthcheck` | `/health` — include downstream only as already configured |
| `appinsights/` | Application Insights | No-op if key blank |
| `properties-volume/` | Azure Key Vault / properties volume | Deployed secrets; do not put real secrets in YAML |
| `cookie/` | Cookie banner + `caseReferenceCookie` | **webpack entry** `cookieConfig.ts` → `cookies` bundle |
| `security/restrictFormContentType` | Rejects unexpected POST content types | Off/skipped in tests as wired in app.ts |
| `ordance-survey-key/` | Ordnance Survey (OS) Places key | Postcode lookup server route + `config/postcode-lookup-exceptions.json` |
| `error/` | Express error handler after routes | |
| `utilityService.ts` | `getClaimById`, `getRedisStoreForSession`, shared helpers | Session uses **official `redis` + connect-redis**, not ioredis |
| `claimDetailsService.ts` | Claim detail fragments for templates | |

## Two Redis clients (do not merge)

1. **Session** — `express-session` + `getRedisStoreForSession()`, cookie `citizen-ui-session`
2. **Drafts** — `app.locals.draftStoreClient` (ioredis)

`connect-redis` major bumps that drop ioredis are a **migration**, not a drive-by.

## Tests

`src/test/unit/modules/<name>/`. CSRF, Helmet, OIDC, draft-store have existing suites — extend them.

Integration draft-store: `src/integration-test/modules/draft-store/`.
