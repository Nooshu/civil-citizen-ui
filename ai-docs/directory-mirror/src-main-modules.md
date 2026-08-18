# `src/main/modules/` — Express cross-cutting

Each folder is typically a class or `enable(app)` style module constructed from `app.ts`. Keep new cross-cutting behaviour here, not in controllers.

| Module | Role | Agent traps |
| --- | --- | --- |
| `oidc/` | Login `/login`, callback `/oauth2/callback`, logout, public-path allowlist | Payment confirmation URLs, eligibility, first-contact, legal pages, UI preview, documents download, assign-claim, claim-issue task list have special cases. Update allowlist if a new unauthenticated GET/POST must work. |
| `nunjucks/` | View engine, filters, search paths (`views/`, govuk-frontend, MoJ frontend) | After changing filters or paths, `yarn test:govuk-fixtures` if macros/env changed |
| `helmet/` | CSP + Helmet | New third-party script = nonce + CSP directives. No `unsafe-inline`. `referrerPolicy` must exist in config. |
| `csrf/` | `@dr.pogodin/csurf` | Skips `/eligibility*`, `/first-contact*`, testing-support. Off when `NODE_ENV === 'test'`. Views need CSRF token (`views/macro/csrf.njk` / `res.locals.csrf`). |
| `draft-store/` | **ioredis** draft client, TTLs, payment session keys, GA/HWF drafts, Redis seed | Keys are often claimId or claimId+userId. `saveDraftClaim` / `getDraftClaimFromStore`. TTL days in config. `redisData.json` seeds non-production. |
| `e2eConfiguration/` | In-memory Redis + fixtures for `e2eTest` | `redisData.json`, `gaRedisData.json` — UI Preview / mocked functional |
| `i18n/` | i18next + `locales/en.json`, `cy.json` | User-visible strings: both languages. Query `lang` + cookie. Flag `enableWelshForMainCase`. |
| `health/` | `@hmcts/nodejs-healthcheck` | `/health` — include downstream only as already configured |
| `appinsights/` | Application Insights | No-op if key blank |
| `properties-volume/` | Azure Key Vault / properties volume | Deployed secrets; do not put real secrets in YAML |
| `cookie/` | Cookie banner + `caseReferenceCookie` | **webpack entry** `cookieConfig.ts` → `cookies` bundle |
| `security/restrictFormContentType` | Rejects unexpected POST content types | Off/skipped in tests as wired in app.ts |
| `ordance-survey-key/` | OS Places key | Postcode lookup server route + `config/postcode-lookup-exceptions.json` |
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
