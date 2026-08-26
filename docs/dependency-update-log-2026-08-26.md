# Dependency Update Log - 2026-08-26

## Summary

Routine pin bumps for packages that had been on npm for **at least seven days** (Yarn `npmMinimalAgeGate: 10080`). Patch/minor only. Known blocked majors were left alone. `@ministryofjustice/frontend` and `jquery` were not re-added.

Validated with `yarn deps:check`, `yarn deps:audit`, and `yarn test:coverage`.

## Completed updates

| Package | From | To | Section | Notes |
| --- | --- | --- | --- | --- |
| `@launchdarkly/node-server-sdk` | `9.13.0` | `9.13.1` | dependencies | Patch; published 18 August 2026 (~7.6 days) |
| `dayjs` | `1.11.21` | `1.11.23` | dependencies | Patch; `1.11.23` published 17 August 2026 (~9 days) |
| `uuid` | `14.0.1` | `14.0.2` | dependencies + resolutions | Patch; also moved the nested `resolutions.uuid` pin from `11.1.1` to `14.0.2` so the lockfile matches the direct pin (Yarn had been installing 11.x for the whole tree). Clears GHSA-w5hq-g745-h8pq (`uuid` buffer bounds check) |
| `webdriverio` | `9.30.1` | `9.31.1` | devDependencies | Newest **9.31.x** past the 7-day gate (`9.31.2` / `9.31.3` still too new). Pulls `@wdio/*` `9.31.1`; drops the `deepmerge-ts` 7.x advisory on `@wdio/config` 9.30.1 |

`yarn-audit-known-issues` was trimmed to **10** toolchain lines Yarn still reports (removed stale `deepmerge-ts`, `immutable`, `serialize-javascript`, `underscore`, and `uuid` advisories that this tree no longer surfaces). Production audit remains empty.

## Waiting on 7-day cooldown (not updated)

| Package | Current | Newest seen | Age at this pass | Notes |
| --- | --- | --- | --- | --- |
| `i18next` | `26.3.6` | `26.4.0` | ~6.1 days | Minor. Yarn would reject resolve until ~27 August 2026 |
| `sass` | `1.102.0` | `1.103.1` | ~5.5 days (`1.103.0` ~6.4 days) | Stay on `1.102.0` until both 1.103.x builds are ≥ 7 days old |
| `webdriverio` | (bumped to `9.31.1`) | `9.31.3` | ~1.3 days (`9.31.2` ~5.4 days) | Further 9.31.x after the gate |

## Blocked or skipped (policy)

| Package | Status | Reason |
| --- | --- | --- |
| `config` v5 | Blocked | ESM-only; dedicated migration |
| `connect-redis` v10 | Blocked | Drops `ioredis` support |
| Babel 8 + Jest 30 / `babel-jest` 30 | Blocked | Coupled toolchain jump |
| `typescript` 7 | Skipped | Major; transitional TypeScript 6 flags still required |
| `@ministryofjustice/frontend` / `jquery` | Do not re-add | Add another is app JS. See [moj-frontend.md](moj-frontend.md) |

## Test outcomes

- `yarn deps:check` — passed (exact pins + lockfile SHA checksums)
- `yarn deps:audit` — production tree clean; **10** accepted toolchain advisories match `yarn-audit-known-issues`
- `yarn test:coverage` — **1050** suites passed, **9096** tests, **0** failed. Global coverage **97.88%** statements, **87.66%** branches, **98.65%** functions, **97.81%** lines (above CI floor **97 / 86 / 97 / 97**). No CoverageReporter `glob.sync` TypeError.

## Risks and unresolved items

- `uuid` 14 is ECMAScript Modules (ESM) only; Jest already lists `uuid` in `transformIgnorePatterns`. Confirm `v4` imports still compile under TypeScript 6 (`@types/uuid` remains `10.0.0`; the package ships its own types).
- `webdriverio` 9.31.1 is functional/end-to-end (e2e) tooling. Unit coverage does not replace a CodeceptJS / Sauce Labs smoke.
- `i18next` 26.4.0 and `sass` 1.103.x stay on the next cooldown pass — do not override `YARN_NPM_MINIMAL_AGE_GATE` for a routine bump.
- `config` 5, `connect-redis` 10, Babel 8 + Jest 30, and TypeScript 7 remain dedicated migrations.
