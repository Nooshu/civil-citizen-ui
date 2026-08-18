# Path aliases and imports

TypeScript `baseUrl` is `src/main`. Bare specifiers resolve from there. **Use these aliases in new server code** — they match ESLint/Jest. Relative `../../../` chains are a smell outside tests.

## `tsconfig.json` paths

| Alias | Resolves to |
| --- | --- |
| `common/*` | `src/main/common/*` |
| `models/*` | `src/main/common/models/*` |
| `form/*` | `src/main/common/form/*` |
| `modules/*` | `src/main/modules/*` |
| `client/*` | `src/main/app/client/*` |
| `routes/*` | `src/main/routes/*` |
| `services/*` | `src/main/services/*` |

Jest `moduleNameMapper` in `jest.config.js` and `jest.functionaltest.config.js` duplicates these, plus:

| Alias | Resolves to |
| --- | --- |
| `app/auth/*` | `src/main/app/auth/*` |
| `otplib` | `__mocks__/otplib.js` |

Webpack `ts-loader` only compiles **bundled** files (`onlyCompileBundledFiles: true`). Server TypeScript is run via `ts-node` + `tsconfig-paths` (`yarn start`).

## What is excluded from the app `tsc` project

Root `tsconfig.json` `exclude`: `src/test`, `src/integration-test`, `playwright`, `webpack`, `node_modules`, `dist`, `coverage`.

- Playwright editor types: `playwright/tsconfig.json` (`noEmit`, `types: ["node"]` only — so Jest/mocha/chai globals do not clash with `@playwright/test`).
- Jest TS: `tsconfig.jest.json` / `tsconfig.jest.integration.json` (`isolatedModules: true`, `rootDir: "."` for TS 6 / TS5011).

## Decorators

`experimentalDecorators: true` is required for **class-validator** form models. Keep that when adding forms under `src/main/common/form/`.

## Compiler flags you must not casually flip

- `"strict": false`
- `"types": ["*"]`
- `"ignoreDeprecations": "6.0"` (needed while `moduleResolution` / `baseUrl` remain transitional before TypeScript 7)
- `"noImplicitAny": true` is already on

## Importing Express `app` in tests

Route unit tests often `import {app} from '../../../../main/app'` (or similar). That **boots the full Express app** (Nunjucks, Redis mock, OIDC wiring). It is slow under coverage.

- Prefer **service tests** that mock `draftStoreService` / `civilServiceClient` and do **not** import `app`.
- Integration tests use `jest.functionaltest.config.js` with roots `src/integration-test` and `src/integration-test/setup/testSetup.ts`.

## ESM-only packages in Jest

`uuid`, `jsdom`, and related packages are ESM. `transformIgnorePatterns` in Jest configs allow babel-jest to transpile them. If a new ESM-only dependency breaks unit tests with “Must use import to load ES Module”, add it to **both** `transform` and `transformIgnorePatterns` in the relevant Jest config — do not rewrite the app to CommonJS workarounds unless asked.
