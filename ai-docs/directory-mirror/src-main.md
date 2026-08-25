# `src/main/` — application root

## Process bootstrap (order matters)

| File | Role | Agent notes |
| --- | --- | --- |
| `server.ts` | HTTPS/HTTP listener | **`installPiiLoggingRedaction()` before `require('./app')`**. `keepAliveTimeout = 185000` (Traefik 502s if you lower this). Dev: TLS from `resources/localhost-ssl/` (gitignored; `bin/generate-ssl-options.sh`). Port `PORT` or `3001`. |
| `app-instance.ts` | `express()` singleton, `x-powered-by` off | Tests and modules import `{app}` from here or from `app.ts`. |
| `app.ts` | Middleware + guards + `routes(app)` | Session Redis, i18n, Helmet, Nunjucks, OIDC, CSRF (not in `test`), shutter check, upload rate limits. **Do not** register routes only in a controller file — they must be invoked from `routes.ts`. |
| `development.ts` | webpack-dev-middleware | Only when `NODE_ENV=development`. |
| `index.js` | webpack **JS/SCSS entry** | Imports app JS, then `initAll()` from `govuk-frontend`, then `initAddAnother()` (also starts `initAppendRow`). New client behaviour: add a file under `assets/js/` and import it here **or** from a module this entry already imports (except the cookies entry). |
| `HttpError.ts` | Shared HTTP error type | Prefer this over ad-hoc throw shapes in controllers. |

## `NODE_ENV` matrix

| Value | TLS | Redis | OIDC | CSRF | Typical command |
| --- | --- | --- | --- | --- | --- |
| `development` | HTTPS | Docker Redis + seed `redisData.json` | Real | On | `yarn start:dev` |
| `test` | n/a | ioredis-mock | Skipped in app wiring | Off | `yarn test` |
| `e2eTest` | HTTP | In-memory (`modules/e2eConfiguration`) | Fake user | Check app.ts | `yarn preview` / `yarn start:e2e` |
| `production` | HTTP behind ingress | Platform Redis, no fixture seed | Real | On | Helm / `yarn start` |

Jest sets `test`. Do not assume `dev.yaml` loads — that file is empty; `development.yaml` is the overlay for `NODE_ENV=development`.

## Subfolders

See dedicated pages: [app](src-main-app.md), [common](src-main-common.md), [modules](src-main-modules.md), [routes](src-main-routes.md), [services](src-main-services.md), [views](src-main-views.md), [assets](src-main-assets.md).

Also:

- `resources/localhost-ssl/` — generated certs, gitignored
- `public/` — webpack output, gitignored, served as static files

## After changing files here

Server TypeScript: focused Jest + fix compile errors. If you change `server.ts` keep-alive or PII install order, say so in the summary (prod 502s / log compliance).
