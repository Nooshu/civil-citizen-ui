# `src/main/app/` — clients and auth helpers

Do **not** add axios/got/fetch wrappers elsewhere. Extend these clients.

## `client/`

| File | Backend | Config |
| --- | --- | --- |
| `civilServiceClient.ts` + `civilServiceUrls.ts` | civil-service (claims, fees, dashboard scenarios, events) | `services.civilService.url` / `CIVIL_SERVICE_URL` |
| `civilServiceRequest.ts` (under `common/`) | Shared request helper: user token + S2S | |
| `gaServiceClient.ts` + `gaServiceUrls.ts` | General applications | `services.generalApplication.url` (often same host as civil-service in deploy) |
| `dmStoreClient.ts` | Document Management | `services.dmStore.baseUrl`; local microservice name may be `xui_webapp` |
| `serviceAuthProviderClient.ts` | S2S tokens | `services.serviceAuthProvider` |
| `legacyDraftStoreClient.ts` | Legacy CMC draft-store API | Still configured; do not use for new journeys |
| `pcq/` | PCQ id + HMAC + redirect | `shutter-pcq` LaunchDarkly flag |

Error types: `client/common/error/` (`callbackError`, `eventSubmissionError`).

Auth on civil-service calls: IDAM access token **and** S2S where required. Functional tests use TOTP (`otplib` mocked in unit tests via `__mocks__/otplib.js`).

### When the API changes

Update client + unit tests (`src/test/unit/app/client/`) + translators + Pact consumers if the interaction exists (`CivilServiceCreateClaim`, `CivilServiceFeePayment`, `Oidc`, `ServiceAuthProvider`). Reduced-stack WireMock only for owned create-claim mappings.

## `auth/`

| Path | Role |
| --- | --- |
| `auth/launchdarkly/launchDarklyClient.ts` | SDK init + flag helpers (`isGaForLipsEnabled`, shutter, dashboard, CARM, MINTI, QM, Welsh, NoC, NRO, judgment buffer, HMCTS Access, case events, …) |
| `auth/user/oidc` | Token exchange / user details used by `modules/oidc` |

e2eTest: LaunchDarkly `TestData`; toggle via testing-support URL `TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT`.

Missing SDK key: callers must tolerate an uninitialised client — do not assume flags are always boolean-true.

## Tests

`src/test/unit/app/auth/`, `src/test/unit/app/client/`. Pact: `src/test/contract/consumers/`.

## Performance

Avoid N+1 civil-service calls in one request. Reuse claim already loaded by `getClaimById` / draft store rather than refetching per section builder.
