# Project overview

## What this application is

**Civil Citizen UI (CUI)** is the citizen-facing frontend for HMCTS specified civil money claims. Litigants in person (LiPs) use it to:

- check eligibility and issue a claim
- respond to a claim (admit, part-admit, or defend)
- reply as a claimant to a defence
- pay fees (claim, hearing, general application) via GOV.UK Pay
- complete mediation, directions questionnaire, and case-progression tasks
- make and respond to general applications (GA)
- view documents, dashboards, and query-management threads

It is **not** a single-page app and **not** a NestJS service. Pages are rendered on the server with Express and Nunjucks. Browser JavaScript is progressive enhancement on markup that already exists in the HTML.

## Who owns it

| Field | Value |
| --- | --- |
| Product | Civil (specified money claims) |
| Owner | `dts_civil` ([catalog-info.yaml](../catalog-info.yaml)) |
| Slack | `#civil_contact` |
| Upstream GitHub | [hmcts/civil-citizen-ui](https://github.com/hmcts/civil-citizen-ui) |
| Default branch | `master` |
| Helm chart | `charts/civil-citizen-ui` (product `civil`, component `citizen-ui`) |
| Jenkins | `cft:HMCTS_a_to_c/civil-citizen-ui` |

Developers typically work on a fork (`origin`) and sync from the `hmcts` remote. See [Contributing](contributing.md).

## Runtime at a glance

| Item | Current target |
| --- | --- |
| Node.js | `>=24.18.0` (see `.nvmrc` and `package.json` `engines`) |
| Package manager | Yarn 4 (`yarn.lock`, `.yarnrc.yml`) — not npm |
| Language | TypeScript `6.0.3` (exact pin) |
| HTTP framework | Express 5 |
| Templates | Nunjucks |
| UI kit | GOV.UK Frontend `6.4.0` plus `@ministryofjustice/frontend` |
| Session / drafts | Redis (`ioredis` for drafts; `connect-redis` + official `redis` for session) |
| Feature flags | LaunchDarkly (`@launchdarkly/node-server-sdk`) |
| Languages | English and Welsh (i18next) |
| Local URL | `https://localhost:3001` in development (self-signed TLS) |
| Health | `/health` |

TypeScript is configured with `"strict": false` and `"ignoreDeprecations": "6.0"` while `moduleResolution` / `baseUrl` remain transitional. Do not “modernise” those compiler options casually; they exist to keep the existing codebase compiling on TypeScript 6.

## What CUI is not responsible for

CUI does not own casework, CCD case definitions, Camunda workflows, or judicial UIs. It is a **citizen client** of:

- **civil-service** — claims, fees, dashboards, events, case data
- **GA service** (via civil-service URL in deployed config) — general applications
- **IDAM / HMCTS Access** — authentication
- **service-auth-provider (S2S)** — service-to-service tokens
- **Document Management (DM store)** — stored documents
- **GOV.UK Pay** — card payments
- **PCQ** — protected characteristics questionnaire
- **Ordnance Survey Places** — postcode lookup

CCD imports, BPMN/DMN pulls, and shared IDAM helpers live under `bin/` and are largely downloaded from civil-service via `./bin/pull-latest-civil-shared.sh`.

## Environments

| Mode | How you start it | Auth | Data |
| --- | --- | --- | --- |
| Local development | `yarn start:dev` | Real IDAM OIDC | Redis on localhost + services you point config at |
| UI Preview | `yarn preview` | None (`NODE_ENV=e2eTest`) | WireMock + in-memory Redis fixtures |
| Production / AAT / preview cluster | Helm / Jenkins | IDAM | Platform Redis, civil-service, Key Vault secrets |
| Unit tests | `yarn test` | Mocked | `ioredis-mock`, nock, fixtures |
| Reduced-stack Jenkins | PR label `pr-values:reducedStack` | Test session user | WireMock mappings from the chart |

## Licence

See [LICENSE](../LICENSE) in the repository root.
