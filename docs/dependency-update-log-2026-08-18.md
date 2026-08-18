# Dependency Update Log - 2026-08-18

## Summary

This log records dependency updates completed from the GitHub dependency dashboard "pull request (PR) Closed (Blocked)" and "Rate-Limited" sections on 2026-08-18.

Each completed update was committed separately and validated with `yarn test:coverage`. Where a coverage failure occurred, only the specific failing test was re-run, per the requested process.

## Completed Updates

| Package | From | To | Notes |
| --- | --- | --- | --- |
| `uuid` | `^11.1.1` | `14.0.1` | ECMAScript modules (ESM) only; added `uuid` to Jest transform config |
| `webpack-cli` | `^5.1.4` | `7.2.2` | Clean upgrade |
| `webpack-dev-middleware` | `7.1.0` | `8.1.1` | Clean upgrade |
| `actions/checkout` | `v4` | `v7` | GitHub Actions workflow update |
| `actions/setup-node` | `v4` | `v7` | GitHub Actions workflow update |
| `actions/setup-python` | `v5` | `v7` | GitHub Actions workflow update |
| `actions/stale` | `v8` | `v11` | GitHub Actions workflow update |
| `stefanzweifel/git-auto-commit-action` | `v5` | `v7` | GitHub Actions workflow update |
| `crs-k/stale-branches` | `v2.0.21` | `v10` | GitHub Actions workflow update |
| `@playwright/test` | `^1.47.2` | `1.62.1` | Clean upgrade |
| `ioredis` | `^5.3.2` | `6.0.0` | RESP3 by default with legacy reply shapes preserved |
| `rate-limit-redis` | `^5.0.0` | `6.0.1` | Compatible with existing `express-rate-limit@8.6.1` |
| `@pact-foundation/pact` | `^15.0.1` | `17.1.2` | One flaky test passed on targeted rerun |
| `jsdom` | `^28.0.0` | `30.0.1` | Added `@asamuzakjp/dom-selector` to Jest transform config |
| `mochawesome` | `7.1.3` | `8.0.1` | Clean upgrade |
| `codeceptjs` | `3.4.1` | `4.1.0` | Clean upgrade |
| `webdriverio` | `^8.3.2` | `9.30.1` | Clean upgrade |
| `allure-codeceptjs` | `^3.4.2` | `3.10.2` | Pinned |
| `allure-commandline` | `^2.29.0` | `2.43.0` | Pinned |
| `allure-js-commons` | `^3.4.2` | `3.10.2` | Pinned |
| `allure-playwright` | `^3.6.0` | `3.10.2` | Pinned |

## Blocked or Skipped Updates

| Package | Status | Reason |
| --- | --- | --- |
| `tough-cookie` | Skipped | Not a direct dependency |
| `undici` | Skipped | Not a direct dependency |
| `connect-redis` v10 | Blocked | Drops `ioredis` support and would require migration to the `redis` package |
| `config` v5 | Blocked | ESM-only and used extensively across the codebase |
| `@ministryofjustice/frontend` v10 | Blocked | Very large jump from `1.6.3` to `10.x` with likely widespread template breakage |
| Babel v8 | Blocked | Tightly coupled with Jest 30 and Babel 8 ESM migration |
| Jest v30 | Blocked | Requires large-scale matcher alias cleanup and snapshot review |

## Test Outcomes

- Completed updates were validated with `yarn test:coverage`.
- Coverage generally passed with `1044` passing suites.
- `@pact-foundation/pact` update produced one failing test in `settleClaimController.test.ts`, which passed on targeted rerun and was treated as flaky.
- `jsdom` v30 initially caused multiple Jest failures because `@asamuzakjp/dom-selector` is ESM-only; this was fixed by extending Jest transform handling in `jest.config.js`.

## Risks and Unresolved Items

- `ioredis@6` now uses Redis Serialization Protocol version 3 (RESP3) by default. It preserves legacy reply shapes, but production Redis behavior should still be confirmed in a real environment.
- `codeceptjs@4` and `webdriverio@9` affect functional/end-to-end (e2e) tooling more than unit coverage, so their runtime behavior should be validated when those suites are next exercised.
- `connect-redis`, `config`, Babel, and Jest remain open as larger migration tasks rather than routine dependency bumps.
