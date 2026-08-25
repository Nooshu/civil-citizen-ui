# `config/` — node-config

Load order: `default.yaml` → `config/{NODE_ENV}.yaml` → env from `custom-environment-variables.yaml` → optional `NODE_CONFIG` JSON.

| File | Agent notes |
| --- | --- |
| `default.yaml` | Local defaults (localhost URLs, TTL **days**, CSRF on, upload rate limit on). Placeholder secrets only. |
| `development.yaml` | Overlay for `NODE_ENV=development` |
| `dev.yaml` | **Empty.** Do not assume it loads. |
| `test.yaml` | Dummy citizen JWT, `idamUrl`, **uploadRateLimit off** |
| `e2eTest.yaml` | UI Preview / mocked functional: **uploadRateLimit off** (`ioredis-mock` has no `.call` for rate-limit-redis) |
| `production.yaml` | **Empty** in git; platform/Helm injects |
| `custom-environment-variables.yaml` | **Required** for any setting that differs per env |
| `postcode-lookup-exceptions.json` | OS Places edge cases |

Human detail (key list, Redis TTL env names): [`docs/configuration.md`](../../docs/configuration.md).

## Rules for agents

- Read with `config.get('path.to.key')`, not new `process.env` (LaunchDarkly SDK is an existing exception).
- New setting: default YAML → env map → Helm values if deployed → update `docs/configuration.md` and this page.
- `referrerPolicy` must remain set or Helmet throws.
- Redis TTL values are **days** (`ttlConfig.ts` converts to seconds). Categories: `draftClaim`, `journeyCache`, `paymentSession`, `gaJourney`.
- `useCSRFProtection` is not the only CSRF switch — `app.ts` also skips CSRF when `NODE_ENV === 'test'`.

## Tests

Many unit tests `nock(config.get('idamUrl')).post('/o/token')`. If you move IDAM URLs in `test.yaml`, those nocks break.
