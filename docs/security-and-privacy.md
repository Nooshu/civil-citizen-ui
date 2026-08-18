# Security and privacy

## Transport and cookies

- Development: HTTPS with a self-signed cert.
- Deployed: HTTP to the pod; TLS at ingress. Session cookie `secure` follows `productionMode` in `app.ts`.
- `SameSite=lax`, rolling sessions, `cookieMaxAge` from config (default 5_400_000 ms).
- `x-powered-by` is disabled.
- Default `Cache-Control`: `no-cache, max-age=0, must-revalidate, no-store`.

## Helmet and CSP

`src/main/modules/helmet` applies `helmet` plus a custom Content-Security-Policy: default `none`, with allowlists for GOV.UK analytics, Dynatrace, Google Tag Manager, 8x8 web chat, and `formAction` including IDAM, OCMC, and GOV.UK Pay.

Script and style nonces come from cookies / `res.locals` (`nonceValue`, `nonceDataLayer`, web chat nonce). If you add a third-party script, you must extend CSP **and** keep nonce usage; do not add `unsafe-inline`.

`referrerPolicy` must be present in config or Helmet setup throws.

## CSRF

`modules/csrf` uses `@dr.pogodin/csurf`. Skipped for:

- `/eligibility*`
- `/first-contact*`
- testing-support draft URLs

Enabled when `NODE_ENV !== 'test'`. Views that POST must include the CSRF token (`res.locals.csrf`).

## OIDC

See [Integrations](integrations.md). Additional points:

- Payment confirmation URLs are treated as return paths from GOV.UK Pay.
- Assign-claim and claim-issue task list have dedicated checks in the OIDC module.
- `restrictFormContentType` rejects unexpected POST content types outside tests.

## Upload rate limiting

When `uploadRateLimit.enabled` is true, `createUploadRateLimitGuard` is applied to query-management, case-progression, mediation, and GA upload routes (Redis-backed via `rate-limit-redis`). Defaults: 20 requests / 60 seconds. Off in unit tests.

## Service shutter

If LaunchDarkly `shutter-cui-service` is on, `checkServiceAvailability` renders `service-unavailable` for non-test environments.

## PII in logs

Do not log:

- names, addresses, emails, dates of birth, telephone numbers
- claim amounts, fees, payments, interest, repayment figures
- wholesale case / party / payment objects

CCD references and operational ids are acceptable. Runtime redaction is installed first in `server.ts` (`src/main/common/logging/piiRedaction`). PR-time Semgrep: [PII logging PR check](pii-logging-check.md). Workflow: `.github/workflows/ci.yml` job `pii-log-check` (advisory warnings; invalid rules fail the job).

## Secrets

Never commit real IDAM, Redis, S2S, OS, or LaunchDarkly secrets. Helm injects Key Vault values. Local `default.yaml` placeholders are intentional.

Functional tests that need secrets use `src/test/secretsConfig.js` and environment-specific vault access — not files in git.

## Security tests

Playwright specs under `playwright/tests/api-security` exercise HTTP security properties against a running app. Functional pipelines may publish extra security diagnostics; see [functional-test-diagnostics](functional-test-diagnostics.md).

## Dependencies

- Prefer exact version pins for packages you change.
- Wait 7 days after a release for routine bumps; security fixes may skip the wait (`AGENTS.md` Dependencies).
- `yarn-audit-known-issues` records accepted audit noise — do not delete it to “go green” without review.
