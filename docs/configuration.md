# Configuration

CUI uses [node-config](https://github.com/node-config/node-config). YAML files under `config/` are merged according to `NODE_ENV`, then environment variables from `config/custom-environment-variables.yaml` overlay them.

Load order (simplified):

1. `config/default.yaml`
2. `config/{NODE_ENV}.yaml` when present (`development`, `test`, `production`, …)
3. Environment variables mapped in `custom-environment-variables.yaml`
4. Optional `NODE_CONFIG` JSON (platform)

There is also `config/dev.yaml` (distinct from `development.yaml`) — check which file your `NODE_ENV` actually loads before editing.

## Files

| File | Role |
| --- | --- |
| `default.yaml` | Local-oriented defaults (localhost civil-service, IDAM, Redis, secrets that are not real) |
| `development.yaml` | Extra local development overrides |
| `test.yaml` | Jest: port, dummy citizen JWT, fees URL, **upload rate limit off** |
| `production.yaml` | Deployed defaults |
| `custom-environment-variables.yaml` | Maps process env → config keys |
| `postcode-lookup-exceptions.json` | Postcode lookup edge cases |

## Important default keys (`config/default.yaml`)

### HTTP and security

- `port` — `3001` (also `PORT` env)
- `timeout` — 30000 ms
- `useCSRFProtection` — true
- `security.referrerPolicy` — `strict-origin-when-cross-origin` (required by Helmet setup)
- `cookieMaxAge` — session cookie max age (ms); env `SESSION_COOKIE_MAX_AGE`
- `uploadRateLimit` — enabled by default; 20 requests / 60 seconds on document upload URLs. Disabled in `test.yaml`.

### Downstream services

| Config path | Default (local) | Env overlay |
| --- | --- | --- |
| `services.civilService.url` | `http://localhost:4000` | `CIVIL_SERVICE_URL` |
| `services.civilService.microservice` | `civil_service` | |
| `services.generalApplication.url` | `http://localhost:4550` | `CIVIL_SERVICE_URL` in env map (deployed GA is often the same host) |
| `services.idam.url` / `authorizationURL` / `tokenURL` | localhost IDAM | `IDAM_API_URL`, `IDAM_WEB_URL` |
| `services.idam.clientID` | `civil_citizen_ui` | `IDAM_CLIENT_ID` |
| `services.idam.callbackURL` | `http://localhost:3001/oauth2/callback` | `OAUTH_CLIENT_REDIRECT` |
| `services.draftStore.redis.host/port` | localhost:6379 | `REDIS_HOST`, `REDIS_PORT` |
| `services.session.redis` | same Redis | `REDIS_HOST`, `REDIS_PORT` |
| `services.dmStore.baseUrl` | `http://localhost:4506` | `DOCUMENT_MANAGEMENT_URL` |
| `services.serviceAuthProvider.baseUrl` | `http://localhost:4502` | `AUTH_PROVIDER_SERVICE_CLIENT_BASEURL` |
| `services.pcq.url` | AAT PCQ | `PCQ_URL` |
| `services.govPay.url` | GOV.UK Pay cards | `GOVPAY_URL` |
| `services.postcodeLookup.ordnanceSurveyApiUrl` | `https://api.os.uk` | `ORDNANCE_SURVEY_API_URL` |
| `services.launchDarkly.sdk` / `env` | empty / `default` | `LAUNCH_DARKLY_SDK`, `LAUNCH_DARKLY_ENV` |
| `appInsights.instrumentationKey` | empty | `APPINSIGHTS_KEY` |
| `services.dynatrace.url` | Dynatrace JS snippet URL | `DYNATRACE_TAG` |

IDAM client secret, OS API key, Redis key, S2S secrets, and PCQ token key are empty or placeholders in git. Deployed values come from Azure Key Vault via `modules/properties-volume` and Helm.

### Redis TTLs (`services.draftStore.redis.ttl`)

Values are **days** in default.yaml:

| Key | Default days | Meaning |
| --- | --- | --- |
| `draftClaim` | 180 | Draft claim issue data keyed by claim id |
| `journeyCache` | 180 | Progress during response / claimant response |
| `paymentSession` | 7 | Payment session and confirmation URLs |
| `gaJourney` | 180 | General application journey keys |

Env: `REDIS_DRAFT_CLAIM_EXPIRE_IN_DAYS`, `REDIS_JOURNEY_CACHE_EXPIRE_IN_DAYS`, `REDIS_PAYMENT_SESSION_EXPIRE_IN_DAYS`, `REDIS_GA_JOURNEY_EXPIRE_IN_DAYS`.

Helpers live in `src/main/modules/draft-store/ttlConfig.ts`. Changing TTL design is a performance/ops decision — mention it in PR summaries.

### Contact and GOV.UK links

- `services.civilMoneyClaims.telephone` / `courtEmailId` / Welsh-speaker telephone
- `services.enforceJudgment.url`
- `services.applyForCertificate.url` (N443)
- `services.cmc.url` — OCMC (legacy CMC UI) for some redirects

### Web chat (8x8)

`webChat.cnbc` and `webChat.mediation` are disabled by default. Env flags such as `WEB_CHAT_CNBC_ENABLED` turn them on in deployed environments.

### Feature toggles in YAML

`featureToggles.settlementAgreementEnabled` (env `SETTLEMENT_AGREEMENT_ENABLED`) sits alongside LaunchDarkly flags. Prefer LaunchDarkly for case-scoped behaviour.

## Test config highlights

`config/test.yaml` supplies:

- a dummy `citizenRoleToken` JWT for nock’d IDAM token responses
- `idamUrl: http://localhost:5000`
- `uploadRateLimit.enabled: false`

Unit tests that hit IDAM typically `nock(config.get('idamUrl')).post('/o/token')`.

## Health check config

```yaml
health:
  timeout: 5000
  deadline: 15000
```

Wired in `src/main/modules/health`. Downstream civil-service health is included in the aggregated `/health` response where configured.

## Adding a new setting

1. Add a default in `default.yaml`.
2. Map an env var in `custom-environment-variables.yaml` if it must differ per environment.
3. Read it with `config.get('path.to.key')` — do not scatter `process.env` except where the codebase already does (LaunchDarkly SDK is one exception).
4. Update this document and any Helm values that must inject the variable.
