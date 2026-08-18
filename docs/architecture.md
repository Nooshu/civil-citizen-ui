# Architecture

## Shape of the application

CUI is a **server-rendered Express application**. A typical authenticated request:

1. Hits Node on port `3001` (`src/main/server.ts`).
2. Passes cookie, language, session, Helmet, health, and (outside tests) CSRF and OIDC middleware (`src/main/app.ts`).
3. Matches a route registered in `src/main/routes/routes.ts`.
4. A **thin controller** validates input, loads the claim, and calls a **service**.
5. The service reads/writes Redis (draft store) and/or **civil-service** / **GA** HTTP APIs.
6. CCD-shaped JSON is converted to CUI models (and back) under `src/main/services/translation/`.
7. The controller renders a Nunjucks view, or redirects to the next URL in `src/main/routes/urls.ts`.

Client JavaScript (`src/main/index.js` → webpack bundle) only enhances pages that already have GOV.UK macro HTML.

This Express SSR + Nunjucks + GOV.UK Frontend shape is the [HMCTS citizen frontend](https://hmcts.github.io/standards/technology-stack/), not an accident. Replacing it with a SPA would fail a service assessment. See [service-assessment.md](service-assessment.md).

```text
Browser
  │  HTTPS (dev) / HTTP behind ingress (deployed)
  ▼
server.ts  ── PII log redaction, keep-alive, TLS in development
  ▼
app.ts     ── session, i18n, Nunjucks, Helmet, OIDC, guards, routes
  ▼
Controller (routes/features/…)
  ▼
Service (services/features/…)  ── draft-store helpers, mapping, fees
  ▼
HTTP clients (app/client/…)    ── civil-service, GA, DM, S2S, PCQ
  ▼
Redis drafts / session         ── ioredis + connect-redis
```

## Process bootstrap

`src/main/server.ts` is the Node entry used by `yarn start` / `yarn start:dev`.

- **PII redaction** is installed *before* `app` is required, so module-level loggers are wrapped (`installPiiLoggingRedaction`).
- **Development** serves HTTPS with `src/main/resources/localhost-ssl/`.
- **Other environments** listen on HTTP; TLS terminates at the platform ingress.
- `keepAliveTimeout` is **185 seconds** so Node does not close keep-alive sockets while Traefik still reuses them (avoids intermittent 502s). `headersTimeout` is left at Node’s default.

The Express instance itself is created in `src/main/app-instance.ts` (`export const app`) with `x-powered-by` disabled. `app.ts` then attaches middleware and routes. Tests import `{app}` from `src/main/app`.

`NODE_ENV` matters:

| `NODE_ENV` | Behaviour |
| --- | --- |
| `development` | HTTPS, webpack-dev-middleware, Redis seed data, CSRF off only if you are not in `test` |
| `test` | Jest; CSRF, service-shutter check, and some guards skipped in `app.ts` |
| `e2eTest` | UI Preview / mocked functional: in-memory Redis, fake session user, no OIDC, test-support flag endpoint |
| `production` | Secure cookies, no Redis fixture seed, platform config |

Jest sets `NODE_ENV=test` automatically.

## Layering (keep it this way)

Standing convention: **do not introduce NestJS, Prisma, React/Vue/Angular, or a second HTTP stack.**

| Layer | Location | Responsibility |
| --- | --- | --- |
| Routes / controllers | `src/main/routes/` | Parse params/body, call service, `res.render` / `res.redirect` |
| Guards | `src/main/routes/guards/` | Journey access (claimant intent, trial arrangements, GA enabled, rate limits, …) |
| Services | `src/main/services/` | Business rules, task lists, check-your-answers builders, CCD mapping |
| Form models | `src/main/common/form/` | class-validator models |
| Domain models | `src/main/common/models/` | Claim, parties, GA, dashboard, CCD-shaped types |
| HTTP clients | `src/main/app/client/` | civil-service, GA, DM store, S2S, PCQ, legacy draft store |
| Modules | `src/main/modules/` | Cross-cutting: OIDC, Nunjucks, Helmet, CSRF, Redis, i18n, health |
| Views | `src/main/views/` | Nunjucks layouts, macros, journey pages |
| Assets | `src/main/assets/` | App JS and SCSS compiled by webpack into `src/main/public/` |

Controllers should stay thin: validate → service → render/redirect.

## URL design

Canonical paths live in `src/main/routes/urls.ts`. Almost all case journeys are under `/case/:id/…`:

| Prefix | Journey |
| --- | --- |
| `/claim` | Issue a claim (no case id yet; Redis draft) |
| `/eligibility` | Public eligibility checker |
| `/first-contact` | PIN / claim reference before login |
| `/dashboard` | Claim list and claim summary |
| `/case/:id/response` | Defendant response, statement of means |
| `/case/:id/claimant-response` | Claimant reply to defence |
| `/case/:id/general-application` | Applicant GA |
| `/case/:id/response/general-application/:appId` | Respondent GA |
| `/case/:id/case-progression` | Evidence, hearings, trial arrangements |
| `/case/:id/mediation` | Free telephone mediation |
| `/case/:id/directions-questionnaire` | DQ |
| `/oauth2/callback` | IDAM return |
| `/ui-preview` | Preview index (e2eTest only) |

## Session versus draft store

Two Redis uses are easy to confuse:

1. **Express session** (`express-session` + Redis store from `getRedisStoreForSession()`). Cookie name `citizen-ui-session`. Holds the logged-in user (tokens, id, roles).
2. **Draft store** (`app.locals.draftStoreClient`, ioredis). Journey JSON keyed by claim id / user id fragments. TTLs are in `config/default.yaml` under `services.draftStore.redis.ttl` and documented in [Configuration](configuration.md).

In `e2eTest`, both are swapped for in-memory implementations (`modules/e2eConfiguration`).

## Feature flags

LaunchDarkly is initialised in `src/main/app/auth/launchdarkly/launchDarklyClient.ts`. Flags currently referenced there include:

- `shutter-cui-service` — whole-service shutter page
- `shutter-pcq`
- `GaForLips` — general applications for LiPs
- `is-dashboard-enabled-for-case`
- `cam-enabled-for-case` (CARM mediation)
- `multi-or-intermediate-track`
- `ea-courts-whitelisted-for-ga-lips`
- `cui-query-management`
- `enableWelshForMainCase`
- `is-defendant-noc-online-for-case`
- `cui-ga-nro`
- `judgment-buffer`
- `hmcts-access-migration`
- `cui-case-events-enabled`

In `e2eTest`, a LaunchDarkly `TestData` source is used so flags can be toggled without a real SDK environment (`TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT`).

## Error handling

- `modules/error` registers the Express error handler after routes.
- Uncaught exceptions and unhandled rejections are logged in `server.ts`.
- Many controllers render `error.njk` or redirect with GOV.UK error summaries (`govukErrorSummary` macro).
- `HttpError.ts` is the shared HTTP error type.

## Performance constraints

See [`AGENTS.md`](../AGENTS.md) — Performance and accessibility. In practice:

- Avoid N+1 civil-service calls in a single request.
- Reuse draft-store helpers; do not read/write Redis repeatedly for the same key in one handler.
- Do not ship extra client JS or rebuild GOV.UK HTML in the browser.
- Call out Redis key/TTL changes in PR summaries.
