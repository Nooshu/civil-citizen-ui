# Root files (agents)

| File | Do this |
| --- | --- |
| `package.json` | Scripts + `engines.node >=24.18.0`. Exact pins for packages you touch. Do not add npm scripts that invoke Jest **without** `--no-sparkplug`. |
| `yarn.lock` | Keep integrity; Yarn 4 |
| `.yarnrc.yml` | Yarn 4.10.3 path, immutable installs, `nodeLinker: node-modules` |
| `.nvmrc` | `v24.18.0` |
| `AGENTS.md` / `AGENT.md` | Standing agent rules; `AGENT.md` is a symlink |
| `README.md` | Getting started + **generated** functional tables (do not hand-edit tables) + link to `docs/` |
| `docs/` | Human documentation |
| `ai-docs/` | This AI mirror |
| `tsconfig.json` | App compile; `strict: false`; path aliases; exclude tests/playwright |
| `tsconfig.jest.json` / `tsconfig.jest.integration.json` | Jest TS 6 `rootDir: "."`, `isolatedModules` |
| `jest.config.js` | Unit; ESM transformIgnore for uuid/jsdom; path mappers |
| `jest.functionaltest.config.js` | Integration |
| `jest.pact.config.js` | Pact |
| `jest.routes.config.js` / `jest.a11y.config.js` / `jest.smoketest.config.js` | Additional Jest entrypoints |
| `jest.setup.js` | nock + retryTimes(2) |
| `jest.setup.redis-mock.js` | ioredis-mock + LaunchDarkly mock |
| `jest.setup.silence-deprecations.js` | Deprecation noise |
| `babel.config.js` | babel-jest for ESM deps / asset JS |
| `eslint.config.mjs` | ESLint 10 flat; indent 2; unix linebreak; always-multiline commas; `no-unused-vars` warn on JS |
| `eslint.config.win.mjs` | Windows |
| `.stylelintrc.json` | SCSS |
| `.editorconfig` | |
| `codecept.conf.js` | Functional; Playwright helper; teardown IDAM users |
| `nodemon.json` | Watch `src/main`; regenerate SSL + ts-node server |
| `webpack.config.js` | See [webpack.md](webpack.md) |
| `Dockerfile` / `Dockerfile.ui-preview` / `docker-compose.yml` / `.dockerignore` | Node 24 Alpine; dockerignore is allowlist-style (`*` then `!` exceptions) |
| `Jenkinsfile_CNP` / `Jenkinsfile_nightly` | Pipelines |
| `sonar-project.properties` | `sonar.sources=src/main`, tests `src/test/`, lcov `coverage/lcov.info` |
| `yarn-audit-known-issues` | Accepted audit noise — do not delete to go green |
| `LICENSE` | |
| `steps.d.ts` | CodeceptJS step typings |
| `__mocks__/otplib.js` | Jest mapper for `otplib` |
| `typing/@hmcts/` | Extra typings (`typeRoots` also lists `./typings` — keep in sync if you add types) |
| `.gitattributes` / `.gitignore` | See [generated-and-ignored.md](generated-and-ignored.md) |
| `.env` / `.env.tests.local` | Gitignored secrets |

## Docker ignore trap

`.dockerignore` excludes **everything** then allowlists `package.json`, `yarn.lock`, `tsconfig.json`, `webpack/**`, `src/main/**`, `config/**`, `webpack.config.js`, `.yarn/**`, `.yarnrc.yml`. Files you add at repo root are **not** in the image unless you update `.dockerignore`.
