# Key changes relative to `hmcts/civil-citizen-ui`

## Key benefits

- **Look at the user interface (UI) on a laptop** — `yarn preview` runs a live GOV.UK UI **without a civil-service backend, Identity and Access Management (IDAM), virtual private network (VPN), or mirrord**. Docker + WireMock is enough.
- **`yarn test` actually runs the unit suite** — upstream’s script only `echo`s a Jest config file (**0 tests executed**). The fork runs the full unit suite (**8,995 tests / 1,044 suites**).
- **Coverage across the codebase** — latest `yarn test:coverage`: **95.36% statements, 84.73% branches, 92.47% functions, 97.85% lines**. Versus upstream: **+200 unit test files (+24%)**, **+1,427 `it()` cases (+22%)**, tests added in forms, services, clients, modules, routes, and client JS — not one corner of the tree.
- **Current toolchain** — TypeScript **6**, ESLint **10**, GOV.UK Frontend **6.4**, Helmet **8**, Application Insights **software development kit (SDK) 3**, Node 24 Jest without Sparkplug crashes.
- **Smaller supply-chain surface** — **89%** of upstream `package.json` specifiers were version ranges; the fork has **0**. `crypto-js` replaced with Node `crypto`; `tar` / `flat` / `formidable` and GitHub Actions majors lifted.
- **People can find how the app works** — human `docs/` is **4.5×** the file count and **6.2×** the line count of upstream’s specialised notes, plus portable `AGENTS.md` and a 31-page `ai-docs/` mirror (upstream has neither).
- **Upgrades that stick** — **100%** of `dependencies` and `devDependencies` are exact pins (upstream **9%**); `yarn.lock` SHA-512 (Secure Hash Algorithm) checksums are **enforced** on install and in continuous integration (CI); a 7-day npm age gate; `yarn test:coverage` after dependency changes.

The product is unchanged: His Majesty’s Courts and Tribunals Service (HMCTS) Civil Citizen UI (Express 5, TypeScript, Nunjucks, GOV.UK Frontend). The fork improves **how** the service is built, tested, secured, documented, and kept current.

---

## Comparison baseline

This document compares **this fork** (`origin`, currently `Nooshu/civil-citizen-ui`) with the upstream default branch **`hmcts/civil-citizen-ui` `master`**.

- **Upstream tip at comparison:** `b6eacffd3e`
- **Fork tip at comparison:** `678f59b020`
- **Date:** 18 August 2026
- **Method:** two-dot file diff (`git diff hmcts/master HEAD`), plus `package.json` pin census, `git ls-tree` line counts, and test-file pairing. `yarn.lock` churn is omitted from narrative counts. Percentage tables below use the same upstream tip and this tree. They are file/specifier/test counts — not estimated hours saved or a claim that the live service is “X% more secure”.

Headline delta (excluding lockfile noise in the prose): on the order of **468 files**, **~28,600 insertions**, **~3,100 deletions**; **278 files added**, **185 modified**, **4 deleted**. About **200 additional Jest unit test files** (`src/test/unit/**/*.test.ts`: **837 upstream → 1,037** on the fork). The fork carries **57 commits** not on upstream; upstream has **2 commits** not yet in the fork (reduced-stack create-claim coverage classification).

Jest coverage percentages for the fork (see [Coverage percentages](#coverage-percentages-and-breadth)) come from `yarn test:coverage` on this tree (18 August 2026). Upstream Codecov currently publishes **unknown** (no comparable public %); the volume and breadth stats below are the like-for-like git comparison.

---

## Benefits by area

| Area | What changed | Why it matters |
| --- | --- | --- |
| **Correctness of local tests** | `yarn test` runs Jest (**8,995** tests) | Upstream’s `test` script is `echo -c jest.config.js` and executes **0%** of the unit suite |
| **Coverage** | **95.36% / 84.73% / 92.47% / 97.85%** stmts/branch/funcs/lines; **+24%** unit files, **+22%** cases vs upstream | Whole-tree unit coverage, not a single-journey spike; more of `src/main` is asserted before preview/AAT |
| **UI contract** | GOV.UK Frontend **6.2.0 → 6.4.0** plus **692** official **fixture HTML** assertions (0 upstream) | Macro-rendered HTML is checked against the Design System release, not guessed |
| **Tooling** | TypeScript **6.0.3**, ESLint **10** flat config, Jest on Node 24 with `--no-sparkplug` | Compiles and lints on the current language/toolchain instead of ESLint 8 / TS 5.9 |
| **Security / supply chain** | **89% → 0%** ranged specifiers; Helmet 8; `crypto-js` removed; Actions on current majors | Unreviewed installs cannot float; one fewer third-party crypto implementation; CI actions no longer sit on deprecated majors |
| **Observability** | Application Insights **SDK 3.15.1** | Compatible with the supported SDK; non-prod can send full telemetry without the old processor API |
| **Local delivery** | **UI Preview** (`yarn preview`) plus **5** fork-only Yarn scripts | Browse the live UI **without a civil-service backend, IDAM, VPN, or mirrord** — Docker + WireMock on the laptop is enough |
| **Knowledge** | Human `docs/` **4.5×** files / **6.2×** lines; `AGENTS.md` + **31** `ai-docs/` pages (0 upstream) | Onboarding and AI-assisted change no longer depend on tribal knowledge or a particular IDE; agents can flag Service Standard deviations |
| **Dependency hygiene** | Exact pins on **100%** of deps/devDeps (upstream **9%**); lockfile SHA **throw**; 7-day age gate | Repeatable upgrades instead of floating ranges, silent majors, or swapped tarballs |
| **Maintainability shape** | `src/main` **+0.4%** lines vs unit tests **+15%** | The product was not rewritten; the extra code is tests, docs, and toolchain |

---

## Measured delta vs `hmcts/master`

Like-for-like counts. Upstream Codecov is **unknown**, so statement/branch **percentages** are fork-only (`yarn test:coverage`, 18 August 2026). PII Semgrep exists upstream as well and is **not** counted as a fork gain.

### Testing and developer productivity

| Metric | Upstream | Fork | Change |
| --- | --- | --- | ---: |
| `yarn test` | `echo -c jest.config.js` (does not run Jest) | 8,995 tests / 1,044 suites | **0% → 100%** of the unit suite actually executed |
| Unit test files (`src/test/unit/**/*.test.ts`) | 837 | 1,037 | **+200 (+24%)** |
| `it(` cases in those files | 6,356 | 7,783 | **+1,427 (+22%)** |
| Unit-test source lines (`src/test/unit` `.ts`/`.js`) | 128,152 | 147,643 | **+15%** |
| Client JS modules with a paired unit file (`src/main/assets/js/`) | 1 / 13 (**8%**) | 13 / 13 (**100%**) | **+12 files**; **2 → 44** `it(` cases |
| GOV.UK `fixtures.json` HTML assertions | 0 | 37 components, **692** fixtures | new Design System contract |
| Helmet CSP / referrer-policy unit tests | absent | present | new |
| Yarn scripts | 56 | 61 | **+5** (`preview`, `start:ui-preview`, `start:ui-preview:down`, `test:govuk-fixtures`, `deps:check`) |

### Security, privacy, and supply chain

| Metric | Upstream | Fork | Change |
| --- | --- | --- | ---: |
| `package.json` specifiers that are version ranges (`^` / `~` / other) | 151 / 169 (**89%**) | 0 / 172 (**0%**) | **−100%** floating ranges |
| Exact pins (`dependencies` + `devDependencies`) | 11 / 124 (**9%**) | 125 / 125 (**100%**) | every direct install is a reviewed version |
| Exact pins including `resolutions` | 18 / 169 (**11%**) | 171 / 172 (**99%**; remaining entry is a Yarn `patch:`) | resolutions no longer carry ranges either |
| `checksumBehavior: throw` + `yarn deps:check` | absent | enforced in install, `cichecks`, and CI | a swapped tarball fails instead of installing |
| 7-day npm publish cooldown (`npmMinimalAgeGate`) | absent | 10,080 minutes | new versions wait a week unless a security override is set |
| Runtime `crypto-js` | `^4.2.0` | removed (Node `crypto`) | **−1** third-party crypto implementation |
| GitHub Actions `uses` entries | checkout/setup-node **v4**, stale **v8**, mixed SHA pins of older majors | all **13** uses on current majors (v7 / v10 / v11) | **100%** of workflow actions refreshed |
| Helmet | `^7` | **8.3.0** (exact) + CSP unit tests | supported major; missing referrer policy still throws |

Privacy controls that **already exist upstream** (PII logging Semgrep, Playwright API-security specs) are unchanged in count. The fork adds discoverable docs and a Playwright `tsconfig` so those specs type-check.

### Maintainability and knowledge

| Metric | Upstream | Fork | Change |
| --- | --- | --- | ---: |
| Application source lines (`src/main` `.ts`/`.js`) | 71,987 | 72,291 | **+0.4%** (journeys not rewritten) |
| Human `docs/*.md` | 4 files, 269 lines | 18 files, 1,667 lines | **4.5×** files, **6.2×** lines |
| `AGENTS.md` | absent | 223 lines | standing conventions for any agent |
| `ai-docs/*.md` | 0 files | 31 files, 1,545 lines | directory mirror + deviation checklist |
| Structured guidance (docs + AGENTS + ai-docs) | 269 lines | 3,435 lines | **~13×** |
| Coverage (statements / branches / functions / lines) | not published | **95.36% / 84.73% / 92.47% / 97.85%** | fork-only; no upstream % to compare |

---

## 1. Documentation and how the team (and agents) work

Upstream `docs/` contains specialised notes only (WireMock contracts, PII Semgrep, functional-test diagnostics/migration). The fork adds a **full project guide** and an **AI-oriented directory mirror**.

### Human documentation (`docs/`)

New guides (not on upstream):

- [docs/glossary.md](docs/glossary.md) — acronyms expanded on first use (HMCTS, litigant in person, IDAM, …)
- [docs/README.md](docs/README.md) — index
- [docs/project-overview.md](docs/project-overview.md), [architecture.md](docs/architecture.md), [directory-structure.md](docs/directory-structure.md)
- [docs/local-development.md](docs/local-development.md), [docs/configuration.md](docs/configuration.md)
- [docs/citizen-journeys.md](docs/citizen-journeys.md), [docs/frontend.md](docs/frontend.md), [docs/integrations.md](docs/integrations.md)
- [docs/security-and-privacy.md](docs/security-and-privacy.md), [docs/testing.md](docs/testing.md), [docs/ci-cd-and-deployment.md](docs/ci-cd-and-deployment.md), [docs/contributing.md](docs/contributing.md)
- [docs/service-assessment.md](docs/service-assessment.md) — Service Standard, Technology Code of Practice, HMCTS stack, Design System (what passing an assessment means)
- [docs/dependency-update-log-2026-08-18.md](docs/dependency-update-log-2026-08-18.md)

The root [README.md](README.md) now links this hub, and the Node prerequisite matches `engines` / `.nvmrc` (`>=24.18.0`) instead of an obsolete Node 14 line.

**Benefit:** new contributors can find request flow, Redis TTL units, journey folders, and “what to run before a PR” without reading hundreds of controllers first.

### Agent conventions (portable, not IDE-specific)

Upstream has **no** `AGENTS.md`. The fork adds vendor-neutral standing conventions so Copilot, Claude, Codex, Cursor, or a human can follow the same rules:

- [AGENTS.md](AGENTS.md) (`AGENT.md` symlink) — **canonical** Yarn 4, GOV.UK macros, Express/TS stack, hmcts sync, Jest SIGSEGV, exact pins, 7-day cooldown, no invented ticket keys, no AI-agent git identity, long-command waits
- [`ai-docs/`](ai-docs/README.md) — directory mirror, change-impact matrix, script catalogue, playbooks, **service-assessment deviation checklist**, and a **mandatory** keep-in-sync instruction so the mirror does not rot
- Conventions are **not** stored as Cursor `.mdc` rule files. Editor leftovers under `.cursor/` (if present) only point at `AGENTS.md`; do not add IDE-specific rule packs

**Benefit:** automated and human changes follow the same constraints (macros, not a second SPA; chart WireMock ≠ preview stubs; exact pins) **regardless of which editor or agent** is used. Agents also have a dated snapshot of the Service Standard, TCoP, HMCTS engineering stack, and GOV.UK Design System so they can recommend against deviations (citizen SPA, hand-rolled GOV.UK HTML, unexplained AI, WCAG regressions) instead of inventing a parallel UI.

### Service assessment and government standards (fork-only snapshot)

Upstream has no mapping of CUI to the assessment manuals. The fork adds:

- [docs/service-assessment.md](docs/service-assessment.md) — what a **service assessment** is (green/amber/red; what you cannot iterate away), all **14 Service Standard** points, the **Technology Code of Practice**, [HMCTS way](https://hmcts.github.io/) citizen **Express SSR** stack, and GOV.UK Design System / Frontend **fixture HTML** tests — scraped 18 August 2026, with live URLs as canonical
- [ai-docs/service-assessment.md](ai-docs/service-assessment.md) — operational deviation table for any coding agent

**Benefit:** future stack or UI suggestions can be judged against the same bar assessors use, without depending on Cursor-only rules or an assessor being in the room.

---

## 2. Developer experience and local delivery

### UI Preview (fork-only)

Upstream local run (`yarn start:dev`) still assumes **IDAM**, **Redis**, and **reachable backends** — typically civil-service and related APIs on localhost or via **VPN / mirrord** (or another cluster tunnel). That is a high bar just to look at a page.

The fork adds a **self-contained UI Preview** environment:

- **No live backend.** HTTP calls are satisfied by **WireMock** stubs (`compose/ui-preview-mappings/`) plus **in-memory Redis** fixtures (`NODE_ENV=e2eTest`). There is no civil-service, CCD, or IDAM process to start.
- **No VPN and no mirrord.** Preview does not tunnel into AAT, preview cluster, or a remote namespace. Docker Compose on the developer machine is sufficient (`compose/ui-preview.yml`).
- **No IDAM login.** A fixture session user (`someID`) and sample claim (`1645882162449409`) are enough to render journeys.
- Commands: `yarn preview` / `yarn start:ui-preview` / `yarn start:ui-preview:down`
- Supporting files: `bin/ui-preview.sh`, `Dockerfile.ui-preview`, `/ui-preview` catalogue (`uiPreviewController`, `pageCatalog`)
- OIDC allowlist for `/ui-preview` so the catalogue is reachable in `e2eTest`
- Header homepage link stays inside the preview app in `e2eTest` (does not dump the user onto gov.uk)

Open **http://localhost:3001/ui-preview** when the stack is up.

Preview stubs are **isolated** from Helm chart WireMock contracts. That preserves the reduced-stack validator’s “no broad matchers” rule while still allowing fixture browsing.

**Benefit:** designers, researchers, and developers can inspect and iterate on the GOV.UK UI in minutes, offline from HMCTS networks. Visual and Nunjucks work no longer blocks on IDAM, CCD imports, VPN access, mirrord, or a full civil-service stack. Preview mappings and chart contracts no longer fight over the same files.

### Tooling that actually runs

| Script / tool | Upstream | Fork |
| --- | --- | --- |
| `yarn test` | `echo -c jest.config.js` (does not run tests) | Jest unit suite via `node --no-sparkplug …/jest.js` |
| `yarn test:govuk-fixtures` | Absent | Official GOV.UK `fixtures.json` vs this app’s Nunjucks |
| Lint | ESLint 8 + `.eslintrc.js` / `win.eslint.json` | ESLint 10 flat `eslint.config.mjs` / `eslint.config.win.mjs` |
| Sass | `sass-loader` 13, default API | `sass-loader` 17 with `loadPaths` so `@import 'node_modules/…'` still resolves |
| Playwright editor types | Inferred project, clashes with Jest globals | `playwright/tsconfig.json` (`noEmit`, `types: ["node"]`) |

**Benefit:** `yarn test` is a trustworthy local and CI-adjacent command. ESLint 10 matches current ESLint (legacy `.eslintrc` is removed). sass-loader 17 does not break GOV.UK Sass resolution. Playwright specs type-check in the editor without polluting the app `tsc` project.

### Node 24 Jest stability

Sparkplug + Jest’s `vm` module can SIGSEGV Node 24 workers (`ClearStaleLeftTrimmedPointerVisitor`). The fork runs **all Jest entry points** with `--no-sparkplug` on the Jest binary (not `NODE_OPTIONS`, which rejects V8 flags). Coverage still uses `--maxWorkers=8` for memory.

**Benefit:** coverage and unit runs complete on the same Node the `engines` field already requires, instead of random worker deaths that look like product bugs.

---

## 3. Testing, quality, and GOV.UK accuracy

### Coverage percentages and breadth

Coverage was expanded **across the whole application**, not a single folder. The fork restored and added unit tests for clients, form models, modules, services/translators, routes/guards, and client JavaScript, then kept running `yarn test:coverage` after dependency work.

#### Latest fork totals (`yarn test:coverage`, 18 August 2026)

| Metric | Coverage |
| --- | ---: |
| **Statements** | **95.36%** |
| **Branches** | **84.73%** |
| **Functions** | **92.47%** |
| **Lines** | **97.85%** |
| Test suites | 1,044 passed / 1,044 |
| Tests | 8,995 passed / 8,995 |

Same run, illustrative **layer** totals (Jest directory rows from that report):

| Area | Stmts | Branch | Funcs | Lines |
| --- | ---: | ---: | ---: | ---: |
| `src/main/modules` | 99.09% | 83.09% | 100% | 98.92% |
| `src/main/app/client` | 97.52% | 84.51% | 96.89% | 97.49% |
| `src/main/common/form/models` | 99.45% | 88.88% | 97.93% | 99.72% |
| `src/main/common/form/validators` | 99.06% | 98.38% | 100% | 98.85% |
| `src/main/common/logging` | 100% | 94.44% | 100% | 100% |
| `src/main/common/utils` | 97.03% | 88.46% | 97.90% | 96.73% |

Many journey **service** folders in that report sit in the mid-90s to 100% on statements and lines (claim, claimant response, dashboard, GA, mediation, query management, response, settlement, UI Preview, first contact, generic form). Branches remain the hardest metric (optional chaining and error paths). Client JS statements look lower (~38%) because vendored `mojAll.js` is in that folder; **lines** for `assets/js` were **95.51%** on the same run.

Jest reports coverage for files **exercised** by the unit suite (`jest.config.js` has no `collectCoverageFrom` allowlist). Adding tests both **brings more of `src/main` into the report** and **raises hits** on those files.

#### Versus upstream `hmcts/master` (git, same date)

Public Codecov for upstream `master` currently shows **unknown**, so a published upstream percentage is not available to quote. Volume, pin, docs, and pairing percentages are in [Measured delta vs `hmcts/master`](#measured-delta-vs-hmctsmaster). The **volume** change is:

| | Upstream | Fork | Change |
| --- | ---: | ---: | ---: |
| Unit test files (`src/test/unit/**/*.test.ts`) | 837 | 1,037 | **+200 (+23.9%)** |
| `it(` cases in those files | 6,356 | 7,783 | **+1,427 (+22.4%)** |
| New unit-test file lines (added files only) | — | — | **+14,402** |
| All of `src/test/` (two-dot) | — | — | **+19,824 / −228 lines** (347 files) |

New unit files by area (spread across the tree):

| Folder under `src/test/unit/` | New files |
| --- | ---: |
| `common/` (forms, models, validators, utils) | 82 |
| `services/` (journeys, translators, content builders) | 80 |
| `assets/` (client JS) | 12 |
| `modules/` (Helmet, health, i18n, Redis, OIDC, …) | 8 |
| `routes/` (controllers, guards, home/unauthorised) | 8 |
| `app/` (civil-service / GA / PCQ clients) | 7 |
| `govukFrontend/` (official fixture HTML) | 2 |

**Benefit:** regressions in forms, HTTP clients, middleware, CCD translators, and browser helpers are more likely to fail in Jest on the laptop, instead of only in AAT CodeceptJS. Line coverage in the high 90s means most executed application lines have at least one test path.

### Unit tests added (what they cover)

- HTTP clients and URL tables (`civilServiceUrls`, `gaServiceUrls`, `civilServiceRequest`, PCQ)
- Helmet CSP / referrer policy
- LaunchDarkly helpers, health, properties-volume, e2e configuration
- **Client JS** (postcode lookup, calculators, cookie banner, language toggle, disable-submit, add-another rows)
- Form models and validators (dates, SoM, repayment, email/phone wrappers)
- Content builders and CCD translators
- Home / unauthorised controllers, several guards
- UI Preview catalogue

**Benefit:** more of the BFF and the progressive-enhancement JS is locked by assertions, not only by CodeceptJS in AAT. Client JS tests reduce the chance of calculator or postcode regressions that functional suites sample sparsely.

### GOV.UK Frontend fixture suite

`src/test/unit/govukFrontend/` renders every official component fixture through this app’s Nunjucks environment and compares HTML to the `govuk-frontend` package `fixtures.json` (whitespace-normalised per Design System guidance).

**Benefit:** upgrades cannot silently drift from the Design System. Accessibility and brand stay with GOV.UK’s own HTML, which is the project’s stated UI source of truth.

### GOV.UK Frontend 6.4.0

Pinned **6.2.0 → 6.4.0**. Combined with fixture tests, the service tracks a current Frontend release rather than freezing on an older patch line.

### Pa11y and functional tooling versions

- `pa11y` **8 → 9.1.1**
- CodeceptJS **3.4.1 → 4.1.0**, WebdriverIO **8 → 9.30.1**, mochawesome **7 → 8**, Allure packages current
- `@playwright/test` **~1.47 → 1.62.1**
- Pact consumer library **15 → 17.1.2**

**Benefit:** a11y and browser stacks are on maintained majors. Pact 17 stays aligned with current consumer workflow. Functional majors still need a dedicated AAT/preview run (see [Open follow-ups](#open-follow-ups)).

---

## 4. Security

### HTTP hardening (Helmet 8)

`helmet` **^7 → 8.3.0** (exact pin). New unit tests assert referrer-policy is required and CSP nonce callbacks run. CSP remains explicit (GOV.UK analytics, Dynatrace, GTM, 8x8, IDAM/Pay form actions) rather than Helmet defaults alone.

**Benefit:** the service rides a supported Helmet major with tests around the configuration that would otherwise fail closed (missing referrer policy throws).

### Removal of `crypto-js`

Upstream depends on `crypto-js` for first-contact PIN session encrypt/decrypt. The fork replaces it with **Node `crypto`** in `src/main/common/utils/cryptoAes.ts`, keeping OpenSSL `Salted__` / EVP_BytesToKey output so in-flight sessions still decrypt.

**Benefit:** one less third-party crypto implementation in the citizen runtime; encryption uses the platform library. (Key derivation remains CryptoJS-compatible by necessity; this is compatibility, not a claim of modern KDF.)

### Dependency resolutions with security history

Yarn resolutions include **`tar` 6.2.1 → 7.5.22**, **`flat` → 6.0.1** (with a `yargs-unparser` patch), **`formidable` 3.5.4**, plus existing pins such as `undici` 7.29.0. `node-fetch` moves **2 → 3.3.2** in resolutions.

**Benefit:** known-noisy or historically exploited transitive packages are lifted in a controlled way instead of waiting for an unrelated install to pull them in.

### GitHub Actions

Workflows use **checkout / setup-node / setup-python v7**, **actions/stale v11**, **stale-branches v10**, **git-auto-commit-action v7**. Upstream still uses v4/v5/v8 in several places.

**Benefit:** CI runs on current Actions (Node 24 already), with a smaller backlog of deprecated action majors.

### Rate limiting and Redis client

`rate-limit-redis` **5 → 6.0.1** (compatible with `express-rate-limit` 8.6.1). `ioredis` **5 → 6.0.0** (RESP3 default; legacy reply shapes preserved in this pin).

**Benefit:** upload rate limiting and the draft store stay on maintained clients. RESP3 in production Redis should still be smoke-tested (see follow-ups).

### PII and Semgrep

PII logging rules and the PR Semgrep job exist **upstream as well**. The fork keeps them and documents them in the human security guide. CI PII scan uses the same Semgrep **1.136.0** pin with updated Actions.

**Benefit:** documentation makes the policy discoverable; the check itself is not unique to the fork.

### Playwright API-security specs

The spec files exist upstream. The fork adds **`playwright/tsconfig.json`** so those tests remain typed and isolated from Jest globals — less chance of “fixing” a security spec with the wrong `expect`.

---

## 5. Observability and operations

Application Insights **^2.9.5 → 3.15.1**:

- Connection string required by SDK 3; bare instrumentation keys from Key Vault are wrapped as `InstrumentationKey=…`
- Config applied **before** `start()` (SDK 3 requirement)
- Non-prod (`LAUNCH_DARKLY_ENV !== prod`) sets `samplingPercentage = 100` (replaces unsupported `addTelemetryProcessor`)
- Error handler `flush()` uses the Promise API

LaunchDarkly SDK **8 → 9.13.0**. `@hmcts/properties-volume` **0.0.14 → 1.4.1**.

**Benefit:** telemetry and Key Vault loading sit on supported majors. Non-prod diagnosis is not silently sampled away; production sampling/cost behaviour is left as SDK default.

---

## 6. Maintainability of the application layer

Application diffs vs upstream are **focused**, not a rewrite (`src/main` **+0.4%** lines; unit tests **+15%** — [Measured delta](#measured-delta-vs-hmctsmaster)):

- UI Preview routes/views/OIDC allowlist (above)
- First-contact PIN uses `cryptoAes` instead of CryptoJS
- App Insights / error `flush` for SDK 3
- Nunjucks globals for preview
- Small validator comment cleanup for ESLint 10
- TypeScript 6 `tsconfig` (`ignoreDeprecations: "6.0"`, explicit `include`/`exclude` so Playwright and tests are not part of the app compile)

**Benefit:** the citizen journeys stay the same shape (controllers → services → GOV.UK macros). The fork invests in **boundaries and compiler layout** rather than a parallel framework.

### Language and i18n

- TypeScript **5.9.3 → 6.0.3** with documented transitional flags (`strict: false` preserved on purpose)
- `i18next` **22 → 26.3.6**
- `jwt-decode` 3 → 4, `uuid` 11 → 14 (ESM; Jest transform updated)

**Benefit:** the compiler and i18n stack are on current majors while the existing codebase still compiles. ESM-only `uuid` is handled in Jest instead of blocking the upgrade.

### Exact pins, SHA checksums, and upgrade policy

**All** `dependencies`, `devDependencies`, and `resolutions` are **exact versions** (no `^`/`~`/ranges). Transitive packages are locked in `yarn.lock` with a **SHA-512 checksum** per npm tarball. `.yarnrc.yml` sets `checksumBehavior: throw` and `npmMinimalAgeGate: 10080` (7 days). `yarn deps:check` (`bin/check-dependency-pins.mjs`) runs in `cichecks` and GitHub Actions; CI install uses Yarn hardened mode.

**Why (vs upstream ranges):** npm ranges let a later install pull different code without a reviewed bump — including compromised patch releases, protestware, and packages that later add telemetry. Checksums stop a same-version archive swap. The 7-day gate waits out npm’s short unpublish window and typical public reporting lag; security fixes may set `YARN_NPM_MINIMAL_AGE_GATE=0` for one command. Full rationale: [docs/security-and-privacy.md](docs/security-and-privacy.md).

Standing rules remain: patch/minor preferred, full `yarn test:coverage` after dependency work, SIGSEGV isolated re-run.

**Benefit:** lockfile and `package.json` agree; “works on my machine” range drift is gone; a poisoned or truncated tarball fails install instead of shipping to citizens.

---

## 7. Frontend performance and accessibility posture

Standing conventions in [`AGENTS.md`](AGENTS.md) (not present upstream) require:

- GOV.UK **macros** for component HTML; no hand-rolled `govuk-button` / error summary / header when a macro exists
- App JS only in `src/main/assets/js/`; app theme only in `src/main/assets/scss/`
- Prefer GOV.UK over axe when they conflict
- Reuse Nunjucks partials instead of copying journey chrome
- Treat frontend performance, API/Redis cost, and accessible UI as first-class on every change

Client JS is now **unit-tested**. `jquery` is **3.7 → 4.0.0**. webpack-dev-middleware **7 → 8.1.1**, webpack-cli **5 → 7.2.2**, copy-webpack-plugin **11 → 14**, css-loader **6 → 7**, babel-loader **9 → 10**.

**Benefit:** UI changes are constrained to the Design System, which is better for citizens (consistent focus, errors, skip link) and cheaper to upgrade. Asset pipeline majors stay installable on Node 24.

---

## 8. CI/CD

- `cichecks` still builds, lints, covers, and runs route integration; it also runs `yarn deps:check` (exact pins + lockfile SHA checksums). WireMock validate/contract steps that exist in this repo’s `package.json` remain in that script on the fork
- GitHub Actions Node 24 + current action majors (section 4); `ci.yml` install uses `YARN_ENABLE_HARDENED_MODE=1` then `yarn deps:check`
- README table-refresh workflows use git-auto-commit **v7**

**Benefit:** CI identities and caches stay on supported Actions. Local `yarn test` finally matches the intent of a unit-test script, so developers are less likely to push untested Jest changes.

---

## 9. What was deliberately not taken as a drive-by major

These were assessed and **left blocked**, with reasons recorded in [docs/dependency-update-log-2026-08-18.md](docs/dependency-update-log-2026-08-18.md):

| Package | Why not now |
| --- | --- |
| `config` v5 | ESM-only; hundreds of CommonJS `require('config')` call sites |
| `connect-redis` v10 | Drops ioredis; session store would need the official `redis` client end-to-end |
| `@ministryofjustice/frontend` v10 | Jump from 1.6.x; template/CSS risk |
| Babel 8 + Jest 30 | Coupled; matcher aliases and snapshots |

**Benefit:** the fork prefers **completable, tested upgrades** over a single explosive toolchain migration. That is a maintainability choice, not unfinished busywork.

---

## Open follow-ups

Honest gaps, not hidden:

1. **Upstream is 2 commits ahead** on reduced-stack create-claim coverage classification. Rebase/merge `hmcts/master` before a long-lived PR.
2. **`ioredis` 6 / RESP3** — confirm against platform Redis (legacy reply shapes are preserved in this version, but behaviour should be checked in AAT).
3. **CodeceptJS 4 / WebdriverIO 9** — unit coverage does not replace a tagged functional run on preview/AAT.
4. **TypeScript `strict` remains false** — required for a TS 6 landing; a future strict pass would be a separate, large effort.
5. **Preview OIDC allowlist** is intentional for `e2eTest`; it must not be copied into production path policy.

---

## Suggested reading order

1. This file (delta vs upstream)
2. [docs/README.md](docs/README.md) — how the service works ([glossary](docs/glossary.md) for acronyms)
3. [docs/service-assessment.md](docs/service-assessment.md) — Service Standard / Technology Code of Practice (TCoP) / Design System mapped to this app
4. [AGENTS.md](AGENTS.md) and [ai-docs/README.md](ai-docs/README.md) — how to change it safely (portable; not tied to a particular integrated development environment (IDE))
5. [docs/dependency-update-log-2026-08-18.md](docs/dependency-update-log-2026-08-18.md) — package-by-package upgrade record
