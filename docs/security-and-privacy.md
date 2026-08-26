# Security and privacy

## Transport and cookies

- Development: HTTPS with a self-signed cert.
- Deployed: HTTP to the pod; Transport Layer Security (TLS) at ingress. Session cookie `secure` follows `productionMode` in `app.ts`.
- `SameSite=lax`, rolling sessions, `cookieMaxAge` from config (default 5_400_000 ms).
- `x-powered-by` is disabled.
- Default `Cache-Control`: `no-cache, max-age=0, must-revalidate, no-store`.

## Helmet and Content Security Policy (CSP)

`src/main/modules/helmet` applies `helmet` plus a custom Content-Security-Policy: default `none`, with allowlists for GOV.UK analytics, Dynatrace, Google Tag Manager (GTM), 8x8 web chat, and `formAction` including Identity and Access Management (IDAM), Online Civil Money Claims (OCMC), and GOV.UK Pay.

Script and style nonces come from cookies / `res.locals` (`nonceValue`, `nonceDataLayer`, web chat nonce). If you add a third-party script, you must extend CSP **and** keep nonce usage; do not add `unsafe-inline`.

`referrerPolicy` must be present in config or Helmet setup throws.

## Cross-Site Request Forgery (CSRF)

`modules/csrf` uses `@dr.pogodin/csurf`. Skipped for:

- `/eligibility*`
- `/first-contact*`
- testing-support draft URLs

Enabled when `NODE_ENV !== 'test'`. Views that POST must include the CSRF token (`res.locals.csrf`).

## OpenID Connect (OIDC)

See [Integrations](integrations.md). Additional points:

- Payment confirmation URLs are treated as return paths from GOV.UK Pay.
- Assign-claim and claim-issue task list have dedicated checks in the OIDC module.
- `restrictFormContentType` rejects unexpected POST content types outside tests.

## Upload rate limiting

When `uploadRateLimit.enabled` is true, `createUploadRateLimitGuard` is applied to query-management, case-progression, mediation, and general application (GA) upload routes (Redis-backed via `rate-limit-redis`). Defaults: 20 requests / 60 seconds. Off in unit tests.

## Service shutter

If LaunchDarkly `shutter-cui-service` is on, `checkServiceAvailability` renders `service-unavailable` for non-test environments.

## Personally identifiable information (PII) in logs

Do not log:

- names, addresses, emails, dates of birth, telephone numbers
- claim amounts, fees, payments, interest, repayment figures
- wholesale case / party / payment objects

Core Case Data (CCD) references and operational ids are acceptable. Runtime redaction is installed first in `server.ts` (`src/main/common/logging/piiRedaction`). Pull request (PR)-time Semgrep: [PII logging PR check](pii-logging-check.md). Workflow: `.github/workflows/ci.yml` job `pii-log-check` (advisory warnings; invalid rules fail the job).

## Secrets

Never commit real IDAM, Redis, S2S, Ordnance Survey (OS), or LaunchDarkly secrets. Helm injects Key Vault values. Local `default.yaml` placeholders are intentional.

Functional tests that need secrets use `src/test/secretsConfig.js` and environment-specific vault access — not files in git.

## Security tests

Playwright specs under `playwright/tests/api-security` exercise HTTP security properties against a running app. Functional pipelines may publish extra security diagnostics; see [functional-test-diagnostics](functional-test-diagnostics.md).

## Dependencies

Exact pins, lockfile Secure Hash Algorithm (SHA) checksums, and a 7-day publish cooldown are standing policy. See [`AGENTS.md`](../AGENTS.md) (Dependencies) for the agent-facing rules.

### What we require

- **`package.json`:** every `dependencies`, `devDependencies`, and `resolutions` specifier is an **exact** version (`1.2.3`, optional pre-release suffix). No `^`, `~`, `>`, `<`, `*`, `x`, or `||`. Nested resolutions (`express/body-parser`) and npm aliases (`npm:@scope/pkg@1.2.3`) must still pin the version. Yarn `patch:` entries are the exception for local patches (the resolution *key* may still name the upstream range it intercepts).
- **`yarn.lock`:** Yarn records a **SHA-512 checksum** of each resolved npm archive (`checksum: 10/<hex>`). `.yarnrc.yml` sets `checksumBehavior: throw` so `yarn install` refuses a tarball that does not match. Optional/os-cpu packages may omit a hash until that platform actually fetches them.
- **Age gate:** `npmMinimalAgeGate: 10080` (7 days in minutes). Yarn will not **select** a version published fewer than 7 days ago when resolving (`yarn add` / `yarn up`). Versions already in the lockfile continue to install. Emergency security: `YARN_NPM_MINIMAL_AGE_GATE=0 yarn up <pkg>`.
- **Checks:** `yarn deps:check` (`bin/check-dependency-pins.mjs`) fails if a specifier is a range or a non-optional lockfile package lacks a checksum. `yarn deps:audit` (`bin/check-yarn-audit.mjs`) runs `yarn npm audit --recursive`: the **production** tree must have **zero** advisories; other findings must match `yarn-audit-known-issues` exactly (new or stale lines fail). Both run in `yarn cichecks` and in `.github/workflows/ci.yml` after install. Continuous integration (CI) install also sets `YARN_ENABLE_HARDENED_MODE=1` (re-validate lockfile metadata against the registry).
- **Renovate:** `.github/renovate.json` writes **exact pins** (`rangeStrategy: pin`), waits **7 days** after publish (`minimumReleaseAge`, matching `npmMinimalAgeGate`), and extends HMCTS `automerge-minor` rather than `automerge-all`. Major updates and `govuk-frontend` stay for human review. Advisory (vulnerability) PRs skip the age gate. GitHub Actions on `renovate/*` / `renovate[bot]` pull requests runs `yarn deps:check`, `yarn deps:audit`, and `yarn test:coverage` so a ranged bump cannot merge just because someone forgot the pin policy.

### Why (security, privacy, npm)

npm’s default ranges are convenient and unsafe for a public justice service:

- **Silent updates.** `^` and `~` mean two developers, or CI last week vs this week, can run different code without a `package.json` change. That has included breaking API changes, new `postinstall` scripts, and packages that later grew outbound telemetry.
- **Account takeover and protestware.** Compromised maintainer credentials (or a malicious patch release) often land as a new version on an existing range. Pinning forces that version to show up as a reviewed diff. Checksums stop a **same-version** tarball swap on a mirror or poisoned lockfile from linking.
- **Unpublish and discovery window.** The npm registry still allows some very new versions to be unpublished, and public reporting of a bad release typically takes hours to days. Yarn’s own docs note registry rules around packages less than three days old. **Seven days** is a conservative, automatable wait: long enough to outlast the common unpublish window and weekend discovery lag, short enough not to freeze patching. It is not a Common Vulnerabilities and Exposures (CVE) scanner; `yarn deps:audit` runs `yarn npm audit` against `yarn-audit-known-issues`.
- **Privacy.** A new transitive can add analytics, error reporters, or unexpected HTTPS calls. Citizens’ claim data must not hitch a ride on an unreviewed upgrade. Exact pins + SHA checks mean the bits on disk are the bits we reviewed.

`yarn-audit-known-issues` records **accepted toolchain** advisories (CodeceptJS `@xmldom/xmldom`, Puppeteer `extract-zip`, Pact-node deprecations, Jest’s nested CommonJS glob 7 / `inflight`, glob 8 via `help-me`, and similar). Do not delete it to “go green” without review, and do not add a production-tree finding there — those must be upgraded instead.
