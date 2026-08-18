# Key changes relative to `hmcts/civil-citizen-ui`

This fork is still His Majesty’s Courts and Tribunals Service (HMCTS) **Civil Citizen UI** (CUI): Express 5, TypeScript, Nunjucks, GOV.UK Frontend. Citizens still issue and respond to money claims through the same journeys. What changed is how the service is **seen, tested, secured, documented, and kept current**.

Upstream `hmcts/civil-citizen-ui` `master` at this comparison is `b6eacffd3e`. This tree is `4ff66bee81` (18 August 2026), rebased onto that tip the same day. The extra work is on the order of **460 files** and **61 commits**; upstream is not ahead. Application source grew **0.4%**. Unit tests grew **15%**. The product was not rewritten.

The rest of this note is the story of that gap. Counts and pins sit at the end for anyone who wants receipts.

---

## You can look at the service on a laptop

Upstream local run (`yarn start:dev`) assumes Identity and Access Management (IDAM), Redis, and reachable backends — typically civil-service on localhost or through a virtual private network (VPN) / mirrord tunnel. That is a high bar just to look at a page.

`yarn preview` starts a self-contained stack: Docker Compose, WireMock stubs, and in-memory Redis fixtures. There is no civil-service, Core Case Data (CCD), or IDAM process to start, and no tunnel into the HMCTS acceptance environment (AAT). A fixture user (`someID`) and five seeded claims are enough to render journeys. Open **http://localhost:3001/ui-preview**.

The catalogue marks claim issue, claimant response (full and part admit), case progression, and general application as ready. Full- and part-admit seeds include an instalment repayment plan (£100 a month from 18 September 2026), so **How they want to pay** shows amount, frequency, first and final dates, and length. The claimant-response task list renders because those seeds include `claimantResponse`. Nested screens past the catalogue entry points may still miss a stub; that is a fixture gap, not a missing backend.

Preview mappings live in `compose/ui-preview-mappings/`, separate from Helm chart WireMock contracts, so browsing fixtures does not weaken the reduced-stack validator’s “no broad matchers” rule. In preview, the header homepage link stays inside the app instead of sending the user to gov.uk.

Designers, researchers, and developers can iterate on Nunjucks and GOV.UK markup in minutes, offline from HMCTS networks.

---

## What you look at is the Design System, not a lookalike

The service’s stated user interface (UI) source of truth is **GOV.UK Frontend**, pinned **6.2.0 → 6.4.0**. Upstream still ships eighteen view files with hand-written `govuk-table`, `govuk-inset-text`, `govuk-header`, or `govuk-button` markup. The fork converted those, plus the preview catalogue — **nineteen** Nunjucks templates. Shared `item-content.njk` is imported by **fifty-nine** other screens, so one table/inset/button conversion reaches confirmation, upload, and content pages across claim, response, case progression, general application, mediation, and query management.

A second pass put the remaining high-traffic components on the same official macros. Claim summary uses `govukTabs` (Design System keyboard and selected-state behaviour, including the official Contents heading). Query lists use `govukTable`. General-application and query uploads share `uploaded-files-summary.njk`; query threads use `query-message-card.njk` with Frontend 6 summary cards. Find address is `govukInput` and `govukButton` (default submit); progressive enhancement still intercepts the click for the Asynchronous JavaScript and XML (AJAX) lookup. Task lists on claim, response, claimant-response, and dashboard redesign use `govukTag`. The paper-form postal address is `govukInsetText`.

That is cheaper than it sounds. GOV.UK HTML, CSS, and JavaScript live in the package. A pin bump plus `yarn test:govuk-fixtures` absorbs structure changes — service navigation, table captions, button `rel` for new tabs, summary cards — instead of rewriting lookalike markup page by page. Citizens see the same GOV.UK look as other government services because the markup **is** the Design System output. Focus order, labels, keyboard behaviour (including tabs), and table structure come from Frontend (Web Content Accessibility Guidelines (WCAG) 2.2 AA). The project prefers GOV.UK over axe when they conflict; macros keep that policy honest.

The fixture suite (`src/test/unit/govukFrontend/`) renders every official component through this app’s Nunjucks environment and compares HTML to the package `fixtures.json` — **692** assertions across **37** components. Upstream has none. Copy-pasted classes cannot be checked that way. Service Standard points 4 and 13 (“look like GOV.UK”) are easier to defend when the HTML is the Design System’s.

Pa11y 9 scans `/dashboard`, `/make-claim`, and `/case/:id/response/your-details`. A green mock run is still not a full WCAG audit.

---

## Local commands tell the truth

Upstream `yarn test` echoes a Jest config path and executes **zero** tests. The fork runs the unit suite: **8,997** tests in **1,045** suites, via `node --no-sparkplug` on the Jest binary so Node 24 workers do not segmentation-fault (SIGSEGV) (Sparkplug plus Jest’s `vm` module). Coverage still uses `--maxWorkers=8` for memory.

Those tests are not a single-folder spike. Versus upstream there are **201** extra unit files (**+24%**) and **1,427** extra `it()` cases (**+22%**): 82 in forms and validators, 80 in journey services, 12 in client JavaScript, the rest in modules, routes, and HTTP clients. **All thirteen** client JS modules now have a paired unit file (upstream had one). Latest `yarn test:coverage` (18 August 2026) on every `src/main` TypeScript and JavaScript file except webpack output and vendored `mojAll.js` is **97.91%** statements, **87.64%** branches, **98.64%** functions, **97.85%** lines, with a continuous integration (CI) floor of **97 / 86 / 97 / 97**. Journey services sit in the mid-90s to 100% on statements and lines. Branches remain the hardest metric.

Upstream coverage only reports files a test already imported, and has no floor. An untested controller here counts as zero and can fail the run. `yarn test:a11y` used to echo that accessibility ran in GitHub Actions — it does not; Pa11y is Jenkins `tests:a11y:parallel` — and that stub always passed. The fork aliases it to the real Pa11y command and **drops it from `yarn cichecks`**, so a green aggregate run cannot pretend accessibility ran. `cichecks` still builds, lints, covers, runs route integration, then `yarn deps:check` and `yarn deps:audit`.

ESLint is **10** (flat config). Sass-loader **17** keeps GOV.UK Sass resolving. Playwright specs have their own `tsconfig.json` so they type-check without clashing with Jest globals. CodeceptJS 4, WebdriverIO 9, Playwright 1.62, and Pact 17 are on maintained majors; they still need a dedicated AAT or preview functional run.

The effect is practical: form, client, middleware, translator, and calculator regressions are more likely to fail in Jest on the laptop, instead of only in AAT.

---

## Installs stay the version you reviewed

**89%** of upstream `package.json` specifiers were version ranges. The fork has **none**. Every `dependencies` and `devDependencies` entry is an exact pin (upstream: **9%**). `yarn.lock` stores a SHA-512 (Secure Hash Algorithm) checksum per npm tarball; `.yarnrc.yml` sets `checksumBehavior: throw`. A 7-day npm age gate (`npmMinimalAgeGate: 10080`) waits out the unpublish window and typical public reporting lag. Security fixes may set `YARN_NPM_MINIMAL_AGE_GATE=0` for one command.

Ranges let a later install pull different code without a reviewed bump — compromised patches, protestware, packages that later add telemetry. Checksums stop a same-version archive swap. `yarn deps:check` and Yarn hardened mode in GitHub Actions enforce that in CI.

Pins are not a Common Vulnerabilities and Exposures (CVE) scan. Upstream documents `yarn npm audit` but does not run it in CI. `yarn deps:audit` requires a clean **production** tree (no allowlist) and an exact match for toolchain lines in `yarn-audit-known-issues`. It runs in `cichecks` and `ci.yml`. A new production advisory fails the build until the package is upgraded.

Renovate extends HMCTS `automerge-minor` (not `automerge-all`), pins ranges, waits seven days, and does not automerge majors or `govuk-frontend`. Its pull requests run pin check, audit, and coverage. The pin policy holds when nobody is watching the bot.

Transitive noise is lifted on purpose: `tar` 7.5.22, `flat` 6.0.1, `formidable` 3.5.4, `node-fetch` 3. First-contact personal identification number (PIN) encryption uses Node `crypto` instead of `crypto-js`, keeping OpenSSL `Salted__` output so in-flight sessions still decrypt. Helmet is **8.3.0** with tests that referrer-policy is required and Content Security Policy (CSP) nonce callbacks run. GitHub Actions `uses` entries are on current majors (checkout / setup-node **v7**, stale **v11**). Rate-limit-redis 6 and ioredis 6 stay on maintained clients; Redis Serialization Protocol version 3 (RESP3) against platform Redis still wants an AAT smoke test.

Personally identifiable information (PII) Semgrep and Playwright API-security specs already exist upstream. The fork documents them and gives the Playwright specs a typed project so a security `expect` is not “fixed” with Jest’s.

---

## Telemetry and the compiler sit on supported majors

Application Insights software development kit (SDK) **3.15.1** needs a connection string (bare Key Vault instrumentation keys are wrapped), config before `start()`, Promise `flush()`, and a supported sampling API. Non-prod (`LAUNCH_DARKLY_ENV !== prod`) samples at 100% so diagnosis is not silently dropped; production sampling stays the SDK default. LaunchDarkly is **9.13.0**. `@hmcts/properties-volume` is **1.4.1**.

TypeScript is **6.0.3** with documented transitional flags (`strict: false` on purpose). i18next is **26**. `uuid` 14 is ECMAScript modules (ESM); Jest transforms it instead of blocking the upgrade. jquery 4 and the webpack 7-era loaders stay installable on Node 24.

A few majors were assessed and **left blocked** — `config` 5 (hundreds of CommonJS `require`s), `connect-redis` 10 (drops ioredis), `@ministryofjustice/frontend` 10, Babel 8 with Jest 30. Those reasons live in [docs/dependency-update-log-2026-08-18.md](docs/dependency-update-log-2026-08-18.md). Completable, tested upgrades beat a single explosive toolchain migration.

Citizen journeys stay the same shape: controllers, services, GOV.UK macros. The application-layer diff is preview routes, `cryptoAes`, Insights flush, Nunjucks preview globals, and compiler layout — not a parallel framework.

---

## People can find how the app works

Upstream `docs/` is four specialised notes (WireMock, PII Semgrep, functional-test diagnostics). The fork’s human guide is **twenty** files and **7×** the line count: architecture, local development, citizen journeys, frontend, integrations, security, testing, CI, contributing, and a [service assessment](docs/service-assessment.md) snapshot (14 Service Standard points, Technology Code of Practice (TCoP), HMCTS Express server-side rendering stack, Design System fixture HTML). The root README points at that hub. Node in the README matches `engines` / `.nvmrc` (`>=24.18.0`) instead of an obsolete Node 14 line.

Upstream has no `AGENTS.md`. The fork adds vendor-neutral standing conventions — Yarn 4, GOV.UK macros, Express/TypeScript stack, exact pins, no invented ticket keys, no Artificial Intelligence (AI) agent git identity — so Copilot, Claude, Codex, Cursor, or a human follow the same rules. [`ai-docs/`](ai-docs/README.md) is a **31**-page directory mirror, script catalogue, and deviation checklist. Conventions are not stored as Cursor `.mdc` files. Structured guidance is about **14×** the upstream line count.

Agents can recommend against a citizen Single Page Application (SPA) — a React- or Angular-style app that updates the page in the browser instead of this Express + Nunjucks service sending HTML — or against hand-rolled GOV.UK HTML or unexplained Artificial Intelligence (AI), because the assessment bar is in the repo, not only in someone’s head.

---

## What is still open

These are honest gaps, not hidden work:

1. Confirm **ioredis 6 / Redis Serialization Protocol version 3 (RESP3)** against platform Redis in AAT (legacy reply shapes are preserved in this pin).
2. A tagged **CodeceptJS 4 / WebdriverIO 9** run on preview or AAT. Reduced-stack browser selection is `@reduced-stack` — see [docs/functional-test-migration-matrix.md](docs/functional-test-migration-matrix.md).
3. TypeScript **`strict` remains false**; turning it on is a separate, large effort.
4. The preview OpenID Connect (OIDC) allowlist is intentional for `e2eTest` and must not be copied into production path policy.

The rebase onto `hmcts/master` on 18 August 2026 skipped this fork’s copy of DTSCCI-5972 (already upstream) and includes DTSCCI-5973 (reduced-stack create-claim coverage classification).

---

## In numbers

Like-for-like vs `hmcts/master` at `b6eacffd3e`. Percentages are file, specifier, and test counts — not estimated hours saved or a claim that the live service is “X% more secure”. Upstream Codecov currently publishes **unknown**; coverage percentages are fork-only (`yarn test:coverage`, 18 August 2026). PII Semgrep exists upstream and is not counted as a fork gain. `yarn.lock` churn is omitted from the prose counts above.

| | Upstream | Fork |
| --- | --- | --- |
| `yarn test` | Echoes a config path (0 tests) | 8,997 tests / 1,045 suites |
| Unit test files | 837 | 1,038 (**+24%**) |
| `it()` cases | 6,356 | 7,783 (**+22%**) |
| Client JS modules with a paired unit file | 1 / 13 | 13 / 13 |
| GOV.UK `fixtures.json` HTML assertions | 0 | 692 (37 components) |
| Hand-written header/table/inset/button views | 18 templates | 0 (19 converted, including preview) |
| `package.json` version ranges | 151 / 169 (**89%**) | 0 / 172 |
| Exact pins (`dependencies` + `devDependencies`) | 9% | 100% |
| Human `docs/*.md` | 4 files, 269 lines | 20 files, 1,882 lines |
| `AGENTS.md` + `ai-docs/` | absent | 225 + 1,545 lines |
| `src/main` application lines | 72,005 | 72,309 (**+0.4%**) |
| Coverage (stmts / branch / funcs / lines) | not published | 97.91% / 87.64% / 98.64% / 97.85% |
| Yarn scripts | 56 | 62 (`preview`, fixture tests, pin check, audit) |

Method: two-dot `git diff hmcts/master HEAD`, `package.json` pin census, `git ls-tree` line counts, and test-file pairing.

---

## Where to read next

1. [docs/README.md](docs/README.md) — how the service works ([glossary](docs/glossary.md) for acronyms)
2. [docs/service-assessment.md](docs/service-assessment.md) — Service Standard / TCoP / Design System mapped to this app
3. [AGENTS.md](AGENTS.md) and [ai-docs/README.md](ai-docs/README.md) — how to change it safely (portable; not tied to a particular editor)
4. [docs/dependency-update-log-2026-08-18.md](docs/dependency-update-log-2026-08-18.md) — package-by-package upgrade record

---

## Meeting readout — highlights and benefits

Written to be read aloud. Figures are versus `hmcts/civil-citizen-ui` `master` on 18 August 2026. The citizen product is unchanged: same journeys, same Express and Nunjucks stack. The fork changes how we **see, test, secure, document, and upgrade** the service.

### One minute

This is still Civil Citizen UI. We did not rewrite the product. Application code grew by less than half a percent; unit tests grew by fifteen percent.

You can now look at the live GOV.UK interface on a laptop with Docker — no Identity and Access Management, no virtual private network, no civil-service backend. What you see is official Design System HTML, not copy-pasted lookalikes, so upgrades, branding, and accessibility travel with the GOV.UK Frontend package.

`yarn test` actually runs the unit suite — almost nine thousand tests. Upstream’s script runs none. Coverage is measured across the whole application tree, at about ninety-eight percent of statements, with a floor in continuous integration (CI).

Every package is an exact pin. Eighty-nine percent of upstream specifiers were floating ranges. Installs cannot silently change. A seven-day npm cooldown and a production audit in CI keep that honest.

People can find how the app works: a full human guide, standing conventions for any coding agent, and a service-assessment snapshot. That is the fork in one minute.

### Talking points

**1. Same product, better way of working.** Citizens still issue and respond to money claims the same way. We invested in tests, documentation, toolchain, and Design System HTML — not a parallel framework, and not a citizen Single Page Application. A Single Page Application, or SPA, is a React- or Angular-style app that runs in the browser and rewrites the page in JavaScript. This service stays Express and Nunjucks: the server sends HTML for each screen.

**2. You can look at the service on a laptop.** `yarn preview` starts Docker, WireMock, and fixture Redis. Designers, researchers, and developers iterate in minutes, offline from His Majesty’s Courts and Tribunals Service (HMCTS) networks. Claim issue, claimant response, case progression, and general application are in the catalogue. Full- and part-admit fixtures include a real instalment plan, so “How they want to pay” is reviewable — amount, monthly frequency, first and final dates — without a live backend.

**3. What you look at is GOV.UK, not a lookalike.** Frontend is on 6.4. Nineteen templates that used hand-written header, table, inset, or button markup now call official macros. A shared fragment carries that into fifty-nine other screens. A second pass put tabs, summary lists and cards, tags, Find address, and the paper-form address on the same macros. One pin bump plus the fixture suite absorbs Design System changes instead of rewriting pages. That is cheaper maintenance, aligned branding, and accessibility that comes from GOV.UK — focus, labels, keyboard including tabs, table structure. We prefer GOV.UK over axe when they conflict.

**4. We can prove the HTML matches the Design System.** Six hundred and ninety-two official fixture assertions, across thirty-seven components. Upstream has zero. Service Standard points about looking like GOV.UK are easier to defend when the markup is the Design System’s own output.

**5. Local test commands tell the truth.** Upstream `yarn test` echoes a config file and executes nothing. We run eight thousand nine hundred and ninety-seven tests in one thousand and forty-five suites. Two hundred and one extra unit files — plus twenty-four percent — across forms, services, clients, modules, routes, and every client JavaScript file. Coverage on the whole `src/main` tree is ninety-seven point nine one percent statements, eighty-seven point six four percent branches, ninety-eight point six four percent functions, ninety-seven point eight five percent lines, with a continuous integration (CI) floor so a new untested file can fail the build. Form, calculator, and postcode regressions are more likely to fail on the laptop, not only in the HMCTS acceptance environment (AAT).

**6. Green CI means what it says.** Coverage counts every application file, not only files a test already imported. Accessibility is no longer a stub in `cichecks` that always passed while claiming Pa11y ran in GitHub Actions — it does not; Pa11y is Jenkins. Pin check and npm audit run in `cichecks` and GitHub Actions. A green run cannot hide untested files, a skipped accessibility suite, or an unaudited lockfile.

**7. Installs stay the version you reviewed.** Zero version ranges; upstream was eighty-nine percent ranges, nine percent exact pins. Lockfile SHA-512 (Secure Hash Algorithm) checksums fail a swapped tarball. New npm versions wait seven days unless we override for a security fix. Production audit must be clean — a new Common Vulnerabilities and Exposures (CVE) identifier fails CI. Renovate automerges minors only, never majors or GOV.UK Frontend, and its pull requests (PRs) run the same checks. The pin policy holds when nobody is watching the bot.

**8. Smaller, current security surface.** First-contact personal identification number (PIN) encryption uses Node’s own crypto, not a third-party library. Helmet 8 with tests around referrer policy and content-security-policy nonces. GitHub Actions on current majors. Known-noisy transitives lifted on purpose. Personally identifiable information scanning was already upstream; we made it discoverable and kept the Playwright security specs typed.

**9. Toolchain on supported majors, without an explosive rewrite.** TypeScript 6, ESLint 10, Node 24 Jest that actually finishes (Sparkplug workaround), Application Insights 3, LaunchDarkly 9, i18next 26, jquery 4. Non-prod telemetry samples at one hundred percent so diagnosis is not silently dropped. We deliberately did **not** take config 5, connect-redis 10, Ministry of Justice Frontend 10, or Babel 8 with Jest 30 — completable upgrades beat a single big-bang.

**10. People can find how the app works.** Human docs are five times the file count and seven times the line count of upstream’s specialised notes. Standing conventions live in AGENTS.md so any person or coding agent follows the same rules — GOV.UK macros, Express and TypeScript, exact pins — not a particular editor. Thirty-one pages of directory context. A dated service-assessment snapshot so we can say no to a citizen Single Page Application or hand-rolled GOV.UK from the manuals, not from memory. Structured guidance is about fourteen times upstream.

### If you have thirty more seconds — what we are honest about

Redis 6 against platform Redis still wants an AAT smoke test. CodeceptJS 4 still needs a tagged functional run on preview or AAT. TypeScript strict mode is still off; turning it on is a separate piece of work. The preview login allowlist is for the laptop stack only and must not land in production.

### Lines you can quote

- You can look at the live user interface (UI) on a laptop. No Identity and Access Management (IDAM), no virtual private network (VPN), no civil-service.
- `yarn test` runs 8,997 tests. Upstream’s script runs none.
- Coverage: 97.91% statements across the whole application tree, with a CI floor.
- 89% of upstream package specifiers were floating ranges. We have none.
- 692 GOV.UK fixture assertions. Upstream has none.
- Application code plus 0.4%. Unit tests plus 15%. Same product.

---

## Key benefits for the Civil development team

What you get if you look at this fork. Same citizen product; the journeys and Express + Nunjucks shape are unchanged.

| If you… | You get… |
| --- | --- |
| Want to see a page | `yarn preview` — live GOV.UK user interface (UI) on a laptop, no Identity and Access Management (IDAM), virtual private network (VPN), or civil-service |
| Need claimant-response screens | Full- and part-admit fixtures with an instalment plan, so **How they want to pay** shows amount, frequency, and dates |
| Worry preview stubs will break reduced-stack | Preview mappings live in `compose/ui-preview-mappings/`, separate from Helm chart WireMock contracts |
| Iterate Nunjucks offline | Designers and developers can work without Core Case Data (CCD), IDAM, or a tunnel into the His Majesty’s Courts and Tribunals Service (HMCTS) acceptance environment (AAT) |
| Touch header, table, inset, or button markup | Official GOV.UK macros on **19** templates; shared `item-content.njk` carries that into **59** other screens |
| Touch tabs, tags, summary lists, or Find address | Official `govukTabs`, `govukTag`, `govukSummaryList` (including cards), `govukInput`, and `govukButton` |
| Edit upload or query summaries | Shared `uploaded-files-summary.njk` and `query-message-card.njk` — one fragment change updates every caller |
| Upgrade GOV.UK Frontend | Pin bump + `yarn test:govuk-fixtures` (**692** assertions, **37** components). Upstream has **none** |
| Defend “look like GOV.UK” | Markup **is** Design System output. Service Standard 4 and 13 are easier to argue |
| Care about accessibility | Focus, labels, keyboard (including tabs), and table structure come from GOV.UK Frontend (Web Content Accessibility Guidelines (WCAG) 2.2 AA). GOV.UK wins if axe disagrees |
| Run unit tests | `yarn test` executes **8,997** tests in **1,045** suites. Upstream’s script runs **none** |
| Compare test volume | **+201** unit files (**+24%**) and **+1,427** cases (**+22%**) vs upstream, across forms, services, clients, modules, routes, and client JS |
| Change client JavaScript | All **13** `src/main/assets/js/` modules have a paired unit file (upstream had **1**) |
| Care about coverage | **97.91%** statements / **87.64%** branches / **98.64%** functions / **97.85%** lines on the whole `src/main` tree |
| Add an untested controller | It counts as zero. Continuous integration (CI) floor **97 / 86 / 97 / 97** can fail the build |
| Trust `yarn test:coverage` | It measures every application file, not only files a test already imported |
| Trust `yarn cichecks` | Builds, lints, covers, route integration, pin check, and audit. Accessibility is **not** a stub that always passed |
| Run accessibility locally | `yarn test:a11y` is the real Pa11y command (Jenkins still runs `tests:a11y:parallel`) |
| Run Jest on Node 24 | `--no-sparkplug` on the Jest binary so workers do not segmentation-fault (SIGSEGV) |
| Lint or compile Sass | ESLint **10** flat config; sass-loader **17** still resolves GOV.UK Sass |
| Type-check Playwright specs | Separate `playwright/tsconfig.json` — no clash with Jest globals |
| Install dependencies | **0** version ranges (upstream **89%**). Every `dependencies` / `devDependencies` entry is an exact pin |
| Worry about a swapped tarball | `yarn.lock` SHA-512 (Secure Hash Algorithm) checksums; `checksumBehavior: throw`; `yarn deps:check` in CI |
| Worry about a brand-new npm package | 7-day age gate. Security fixes can skip it for one command |
| Need a Common Vulnerabilities and Exposures (CVE) scan, not just pins | `yarn deps:audit` — production tree must be clean; runs in `cichecks` and GitHub Actions |
| Leave Renovate unattended | `automerge-minor` only, pinned ranges, 7-day wait; no automerge of majors or `govuk-frontend`. Its pull requests (PRs) run pin check, audit, and coverage |
| Encrypt first-contact personal identification number (PIN) | Node `crypto` instead of `crypto-js`; in-flight sessions still decrypt |
| Configure Helmet | Helmet **8.3.0** with tests that referrer-policy is required and Content Security Policy (CSP) nonce callbacks run |
| Update GitHub Actions | checkout / setup-node **v7**, stale **v11** — current majors, not v4/v8 |
| Lift noisy transitives | `tar` 7.5.22, `flat` 6.0.1, `formidable` 3.5.4, `node-fetch` 3 — reviewed, not an accidental install |
| Send telemetry | Application Insights software development kit (SDK) **3.15.1**; non-prod samples at **100%** so diagnosis is not silently dropped |
| Use feature flags or Key Vault | LaunchDarkly **9.13.0**; `@hmcts/properties-volume` **1.4.1** |
| Compile TypeScript | **6.0.3** with documented transitional flags (`strict: false` on purpose) |
| Use i18n or ESM packages | i18next **26**; `uuid` 14 transformed in Jest instead of blocking the upgrade |
| Bump webpack / jQuery | jquery **4** and webpack 7-era loaders installable on Node 24 |
| Wonder why some majors were skipped | Reasons recorded (`config` 5, `connect-redis` 10, Ministry of Justice Frontend 10, Babel 8 + Jest 30) — completable upgrades, not a big-bang |
| Onboard someone | Human `docs/` is **20** files / **7×** the line count of upstream’s specialised notes, plus a glossary |
| Ask an agent or a human to change code | `AGENTS.md` — same rules for Copilot, Claude, Codex, Cursor, or a person (not Cursor-only `.mdc` files) |
| Need directory-level context | **31** `ai-docs/` pages: mirror, playbooks, script catalogue, service-assessment deviation checklist |
| Judge a stack or UI proposal | Dated Service Standard / Technology Code of Practice (TCoP) snapshot — say no to a citizen Single Page Application (SPA) or hand-rolled GOV.UK from the manuals |
| Read the README Node line | Matches `engines` / `.nvmrc` (`>=24.18.0`), not an obsolete Node 14 line |
| Look at application source size | `src/main` **+0.4%** lines. Unit tests **+15%**. The extra code is tests, docs, and toolchain — not a rewrite |
