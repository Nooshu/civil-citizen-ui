# Dependency Update Log - 2026-08-21

## Summary

Routine pin bumps for direct dependencies, `devDependencies`, and `resolutions` whose newer versions had been on npm for **at least seven days** (Yarn `npmMinimalAgeGate: 10080`). Prefer patch/minor only. Known blocked majors were left alone.

Validated with `yarn deps:check`, `yarn deps:audit`, `yarn build`, and `yarn test:coverage`.

## Completed Updates

| Package | From | To | Section | Notes |
| --- | --- | --- | --- | --- |
| `@dr.pogodin/csurf` | `1.16.9` | `1.17.1` | dependencies | Also mirrored in `resolutions.csurf` |
| `@types/lodash` | `4.17.24` | `4.17.25` | dependencies | |
| `@types/luxon` | `3.7.1` | `3.7.4` | dependencies | |
| `applicationinsights` | `3.15.1` | `3.16.0` | dependencies | |
| `axios` | `1.18.0` | `1.19.0` | dependencies + resolutions | |
| `express-rate-limit` | `8.6.1` | `8.6.2` | dependencies | |
| `i18next-fs-backend` | `2.6.6` | `2.6.7` | dependencies | |
| `i18next-http-middleware` | `3.9.7` | `3.9.8` | dependencies | |
| `minimatch` | `10.2.5` | `10.2.6` | dependencies | |
| `otplib` | `13.4.0` | `13.4.1` | dependencies + resolutions | |
| `@typescript-eslint/eslint-plugin` | `8.66.0` | `8.67.0` | devDependencies | |
| `@typescript-eslint/parser` | `8.66.0` | `8.67.0` | devDependencies | |
| `globals` | `17.9.0` | `17.11.0` | devDependencies | |
| `html-webpack-plugin` | `5.6.7` | `5.6.8` | devDependencies | |
| `sass` | `1.100.0` | `1.102.0` | devDependencies | Latest `1.103.1` still inside 7-day gate |
| `ts-jest` | `29.4.11` | `29.4.12` | devDependencies | |
| `ts-loader` | `9.5.7` | `9.6.2` | devDependencies | |
| `webpack` | `5.107.2` | `5.109.2` | devDependencies | |
| `flatted` | `3.4.2` | `3.4.4` | resolutions | |
| `qs` | `6.15.2` | `6.15.3` | resolutions | |
| `semver` | `7.8.1` | `7.8.5` | resolutions | |
| `ip-address` | `10.4.0` | `10.5.0` | resolutions | |
| `ws` | `8.21.0` | `8.21.3` | resolutions | |
| `postcss` | `8.5.23` | `8.5.26` | resolutions | |
| `@opentelemetry/core` | `2.8.0` | `2.10.0` | resolutions | |

## Waiting on 7-day cooldown (not updated)

| Package | Current | Newest seen | Age (approx.) | Notes |
| --- | --- | --- | --- | --- |
| `@launchdarkly/node-server-sdk` | `9.13.0` | `9.13.1` | ~2.5 days | Patch |
| `dayjs` | `1.11.21` | `1.11.23` | ~3.8 days | Patch |
| `i18next` | `26.3.6` | `26.4.0` | ~1 day | Minor |
| `uuid` | `14.0.1` | `14.0.2` | ~2.6 days | Patch |
| `sass` | (bumped to `1.102.0`) | `1.103.1` | ~0.4 days | Further minor still gated |
| `webdriverio` | `9.30.1` | `9.31.2` | ~0.2 days | Minor |
| `js-yaml` (resolution) | `4.3.1` | `5.3.0` | ~6.9 days | Major; also just short of gate |

## Blocked or skipped (policy)

| Package | Status | Reason |
| --- | --- | --- |
| `config` v5 | Blocked | ESM-only; major migration |
| `connect-redis` v10 | Blocked | Drops `ioredis` support |
| `@ministryofjustice/frontend` v10 | Removed from the tree (24 August 2026) | v10 was spiked then **dropped**. Add another is app JS. Do not re-add. See [moj-frontend.md](moj-frontend.md). |
| Babel 8 / Jest 30 / `babel-jest` 30 | Blocked | Coupled toolchain jump |
| `typescript` 7 | Skipped | Major; transitional TS 6 flags still required |
| `@types/node` 26 | Skipped | Engines target Node 24; stay on `@types/node` 24.x |
| `class-validator` `0.15` | Skipped | 0.x minor treated as breaking risk |
| `reflect-metadata` `0.2` | Skipped | 0.x minor treated as breaking risk |
| `shelljs` `0.10` | Skipped | Resolution pin; 0.x jump |
| `undici` 8 / `cookie` 2 / `tough-cookie` 6 / `nanoid` 6 / `@babel/runtime` 8 / `fast-uri` 4 | Skipped | Resolution majors |

## Test outcomes

- `yarn deps:check` — passed (exact pins + lockfile checksums)
- `yarn deps:audit` — production tree clean; 15 accepted toolchain advisories match `yarn-audit-known-issues`
- `yarn build` — webpack **5.109.2** compiled successfully
- `yarn test:coverage` — **1047** suites passed, **0** failed; global coverage **97.87%** statements, **87.59%** branches, **98.64%** functions, **97.81%** lines (above CI floor **97 / 86 / 97 / 97**). Jest printed a CoverageReporter threshold TypeError after the run (`Cannot read properties of undefined (reading 'sync')`) but exited **0**; totals were written to `coverage/coverage-summary.json`. (Later nested `@jest/reporters/glob` at `7.2.3` so that TypeError should not recur; this log still describes the 21 August run.)

## Risks and unresolved items

- Application Insights **3.16** and axios **1.19** are minor bumps; watch non-prod telemetry and outbound HTTP behaviour in AAT if anything looks off.
- OpenTelemetry core resolution moved to **2.10.0** with Application Insights; confirm App Insights still initialises cleanly in development.
- Remaining cooldown-gated patches (`uuid`, LaunchDarkly, `dayjs`, `i18next`, `sass` 1.103.x, `webdriverio`) should be picked up after seven days on npm.
