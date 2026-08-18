# Integrations

CUI is a BFF-style Express app: it does not persist claims in its own database. Case truth lives in **civil-service / CCD**. Redis holds drafts, session, and short-lived payment state.

## civil-service

Client: `src/main/app/client/civilServiceClient.ts`  
URLs: `civilServiceUrls.ts`  
Config: `services.civilService.url` (env `CIVIL_SERVICE_URL`)

Used for (non-exhaustive):

- Creating and submitting LiP claims (`CREATE_LIP_CLAIM` and other events)
- Fetching a case by id and user case roles
- Fee calculation (`/fees/claim/{amount}`, `/fees/hearing/{amount}`, total-amount)
- Dashboard scenario creation
- Claimant/defendant events during response and case progression

Auth headers are produced with the user’s IDAM access token plus S2S where required (`civilServiceRequest.ts`).

**Reduced-stack / WireMock:** consumer-owned mappings for a create-claim subset live in `charts/civil-citizen-ui/wiremock`. See [reduced-stack WireMock contracts](reduced-stack-wiremock-contracts.md). Run `yarn wiremock:validate` and `yarn test:wiremock-contracts` when those files change.

## General applications

`gaServiceClient.ts` talks to `services.generalApplication.url`. In deployed env mapping this is often the same as `CIVIL_SERVICE_URL`. Feature-flagged for LiPs (`GaForLips`).

## IDAM / OIDC / HMCTS Access

`modules/oidc` plus `app/auth/user/oidc`.

- Login: `/login` → IDAM authorize URL
- Callback: `/oauth2/callback`
- Logout: `/logout` → IDAM end session, then `signOutCallBackURL` (dashboard)
- Public paths (eligibility, first-contact, static legal pages, UI preview, payment confirmation) skip the login redirect
- `hmcts-access-migration` switches aspects of host/authorize behaviour

Citizen role is configured as `services.idam.citizenRole`. Unauthorised users hit `/unauthorised`.

## Service-to-service (S2S)

`serviceAuthProviderClient.ts` leases tokens from `services.serviceAuthProvider`. Used when calling civil-service and DM store as a microservice. Functional tests generate TOTP against the S2S secret (`totp-generator`).

## Redis

| Use | Client | Notes |
| --- | --- | --- |
| Express session | `connect-redis` + official `redis` package via `getRedisStoreForSession()` | Cookie `citizen-ui-session` |
| Drafts / journeys | `ioredis` (`DraftStoreClient`) | Seeded with `redisData.json` when not production |
| Preview / e2eTest | in-memory mocks | No Docker Redis required |

TLS is `services.draftStore.redis.tls` (`REDIS_TLS`).

`connect-redis` v7 is the current pin. Major upgrades that drop ioredis support require a coordinated Redis-client migration — do not bump in isolation.

## Document management

`dmStoreClient.ts` downloads/uploads using DM base URL and S2S. Microservice name defaults to `xui_webapp` locally.

## GOV.UK Pay

Card payments for claim, hearing, and GA fees. Users leave CUI for `services.govPay.url` and return to payment-confirmation routes. Redis stores the original confirmation URL so OIDC can restore context.

## PCQ

`app/client/pcq/` generates an id and HMAC token and redirects to the PCQ service. Can be shuttered with `shutter-pcq`.

## Ordnance Survey Places

Postcode lookup: browser JS calls CUI `/postcode-lookup`, which calls OS Places with `ORDNANCE_SURVEY_API_KEY`. Exceptions file: `config/postcode-lookup-exceptions.json`.

## LaunchDarkly

See flag list in [Architecture](architecture.md). SDK key from `LAUNCH_DARKLY_SDK`. User context includes `LAUNCH_DARKLY_ENV`. Missing SDK means flags are not initialised — callers must tolerate empty client.

## Application Insights and Dynatrace

- App Insights: `modules/appinsights` — no-op when the instrumentation key is blank; connection string or key from `APPINSIGHTS_KEY`.
- Dynatrace: JS snippet URL from config, CSP `connectSrc` / `scriptSrc` allow `*.dynatrace.com`.

## Legacy CMC / OCMC

`services.cmc.url` points at the older Online Civil Money Claims UI for some continue-on-legacy links. `legacyDraftStoreClient` remains for historical draft-store API compatibility.

## Contact centre web chat

8x8 widgets for CNBC and mediation, gated by `webChat.*.enabled`. CSP in Helmet allowlists `vcc-eu4.8x8.com` and related hosts.

## When a backend contract changes

1. Update the TypeScript client and unit tests (and Pact if the interaction is covered).
2. Update translators if CCD fields moved.
3. Update chart WireMock mappings **only** for the reduced-stack create-claim set you own.
4. Do not “fix” preview by loosening chart matchers — use `compose/ui-preview-mappings/` for browsing fixtures.
