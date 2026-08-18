# Local development

## Prerequisites

- **Node.js** matching `.nvmrc` / `package.json` `engines` (currently `>=24.18.0`). Use `nvm use` (or equivalent) before install and test.
- **Yarn 4** — this repo is not npm. `yarn.lock` and `.yarnrc.yml` must stay intact.
- **Docker** — required for Redis (`yarn start:redis`) and user interface (UI) Preview.
- Optional: Java/Core Case Data (CCD) tooling if you import definitions locally via `bin/` scripts.

The `engines` field and `.nvmrc` are authoritative if other documents disagree.

## First-time setup

```bash
nvm use
yarn install
./bin/pull-latest-civil-shared.sh   # also runs on postinstall; downloads bin/shared/
yarn build                          # webpack → src/main/public/
```

`postinstall` already calls `pull-latest-civil-shared.sh` and ignores failure (`|| true`), so a missing network to civil-service will not block install, but CCD helper scripts will be absent until you run it successfully.

## Run modes

### Full local app (Identity and Access Management (IDAM) + Redis)

```bash
yarn start:dev
```

This starts Redis from `compose/draft-store.yml` and nodemon (`nodemon.json`) on `src/main/server.ts` with `NODE_ENV=development`.

- App: **https://localhost:3001** (self-signed certificate)
- Health: **https://localhost:3001/health**
- Redis: `localhost:6379`

You need working IDAM and civil-service URLs in config (see [Configuration](configuration.md)). Webpack-dev-middleware compiles assets on the fly in development (`src/main/development.ts`).

Windows variants: `yarn startwin` / `yarn startwin:dev`.

Production-style start (no nodemon, `NODE_ENV` defaults to production):

```bash
yarn start
```

### User interface (UI) Preview (no IDAM)

```bash
yarn preview
# same as: yarn start:ui-preview
```

Opens **http://localhost:3001/ui-preview**.

| | UI Preview | `yarn start:dev` |
| --- | --- | --- |
| Auth | None (`e2eTest` fake session user) | IDAM OpenID Connect (OIDC) |
| Backends | WireMock + in-memory Redis | Real Redis + services |
| Fixture user id | `someID` | Your IDAM user |
| Sample claims | `1645882162449409` (awaiting defendant), plus full admit / part admit / case progression / general application (GA) (`1645882162449601`–`9604`) | Whatever exists in your stack |
| Mappings | `compose/ui-preview-mappings/` | n/a |

Stop with `yarn start:ui-preview:down`.

Preview stubs are **not** the reduced-stack chart contracts. Do not copy preview mappings into `charts/civil-citizen-ui/wiremock/mappings`. See [reduced-stack WireMock contracts](reduced-stack-wiremock-contracts.md).

### Docker Compose (full frontend container)

```bash
docker-compose build
docker-compose up
```

Then browse https://localhost:3001.

## Everyday commands

| Command | What it does |
| --- | --- |
| `yarn lint` | ESLint 10 flat config + stylelint |
| `yarn lint:win` | Same with `eslint.config.win.mjs` |
| `yarn lint --fix` | Auto-fix where ESLint allows |
| `yarn build` | webpack development-ish bundle |
| `yarn build:prod` | `NODE_ENV=production` webpack |
| `yarn test` | Jest unit tests |
| `yarn test:coverage` | Jest with coverage (`--maxWorkers=8`); all `src/main` TS/JS plus a global floor |
| `yarn test:govuk-fixtures` | Official GOV.UK macro HTML vs `fixtures.json` |
| `yarn test:integration` | Route integration tests (alias `test:routes`) |
| `yarn deps:check` | Exact pins + lockfile SHA checksums |
| `yarn deps:audit` | `yarn npm audit` vs `yarn-audit-known-issues`; production tree must be clean |
| `yarn cichecks` | install, deps:check, deps:audit, build, lint, WireMock validate + contracts, coverage, routes |

Jest unit/coverage scripts pass `--no-sparkplug` because Sparkplug + Jest’s `vm` module can SIGSEGV Node 24 workers. Do not move that flag into `NODE_OPTIONS` (Node rejects V8 flags there). Details: [AGENTS.md](../AGENTS.md) and [Testing](testing.md).

## SSL certificates

Development HTTPS uses `src/main/resources/localhost-ssl/`. `bin/generate-ssl-options.sh` regenerates them if needed. Browsers will warn about the self-signed cert.

## Shared civil-service scripts

```bash
./bin/pull-latest-civil-shared.sh
./bin/pull-latest-civil-shared.sh some-branch
```

Files land in `bin/shared/`. Preview pipelines can override the branch with the GitHub label `civilShared:????`.

## Common problems

- **Port 3001 or 1111 in use** — UI Preview tries to free them; locally, stop the other Node/WireMock process.
- **Lockfile YN0028** — an install wanted to change `yarn.lock` while immutable installs were on. For intentional bumps use `YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install`.
- **Jest worker SIGSEGV** — re-run the failed file alone. If it passes, treat it as the known V8 crash, not a product bug.
- **Need a claim without IDAM** — use UI Preview. Start from `/ui-preview`: awaiting-defendant `1645882162449409`, full admit by instalments `1645882162449601`, part admit by instalments `1645882162449602`, case progression `1645882162449603`, general application `1645882162449604`.
- **Claimant-response task list “something went wrong”** — Preview loads the claim from Redis first (`uiPreviewRedisData.json`). Admit fixtures must include `case_data.claimantResponse`. After changing that file or `src/main/common/models/claim.ts`, rebuild with `yarn preview` (the image copies `src/` at build time).
