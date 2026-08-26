# Key changes relative to `hmcts/civil-citizen-ui`

This fork is still His Majesty’s Courts and Tribunals Service (HMCTS) **Civil Citizen UI** (CUI): Express 5, TypeScript, Nunjucks, GOV.UK Frontend. Citizens still issue and respond to money claims through the same journeys. I did this work alone. What changed is how the service is **seen, tested, secured, documented, and kept current**.

Upstream `hmcts/civil-citizen-ui` `master` at this comparison is `5351e5b603`. This tree is rebased onto that SHA: **0 behind**. The extra work is on the order of **681 files**. Application TypeScript and JavaScript (excluding webpack output) is **73,303** lines as of 25 August 2026 versus **72,153** on that upstream SHA (**+1.6%**). Unit-test extras versus that SHA are **+23%** `it()` cases (see the numbers table). The product was not rewritten.

The rest of this note is the story of that gap. Counts and pins sit at the end if you want receipts.

---

## You can look at the service on a laptop

Upstream local run (`yarn start:dev`) assumes Identity and Access Management (IDAM), Redis, and reachable backends — typically civil-service on localhost or through a virtual private network (VPN) / mirrord tunnel. That is a high bar just to look at a page.

`yarn preview` starts a self-contained stack: Docker Compose, WireMock stubs, and in-memory Redis fixtures. There is no civil-service, Core Case Data (CCD), or IDAM process to start, and no tunnel into the HMCTS acceptance environment (AAT). A fixture user (`someID`) and six seeded claims are enough to render journeys. Open **http://localhost:3001/ui-preview**.

The catalogue lists Ready GET links (eligibility, claim issue, response, statement of means, mediation including the settlement-agreement document, directions questionnaire, claimant response, case progression, general application, query management). Grow it by seeding WireMock/Redis (or a production-safe fallback) for GETs that still 500 or look empty — not by adding links toward a count.

Ready means a useful GET of that Nunjucks template with fixture data. Omitted on purpose: document downloads, GOV.UK Pay returns, unregistered URL constants, PIN-gated first-contact claim summary, check-your-answers and confirmations that redirect until a journey is complete, query create (needs a share-query session), and N245 (not a strike-out type). Small production-safe guards keep those GETs honest: defendant timeline passes `today` and empty `rows`; evidence check-your-answers tolerates a missing upload form; continue-claiming-interest passes a **string** legend into `yesNoRadioButton` (nested HTML as `title` 500s).

### Preview screens that used to look broken

These are production-safe guards plus fixture data, not preview-only hacks:

- **How they want to pay / Your payment plan.** Full- and part-admit seeds include an instalment plan (**£100** a month). The same figures sit on `claimantResponse.suggestedPaymentIntention.repaymentPlan`. `getRepaymentScheduleDisplay` and `calculate-length-repayment.js` (runs when `document.readyState` is `complete`, not only on `window` `load`) so **Your payment plan** shows **10 months** instead of a dash.
- **Court offered set date.** Admit fixtures seed `paymentIntention.paymentDate` (when ten £100 months would finish). `getPaymentDate` reads that field so the page is not Luxon `Invalid DateTime`.
- **Settle the claim for £…** uses `Claim.amountDefendantAdmittedInPounds()` (full claim amount on a full admission). Formatting `partialAdmissionPaymentAmount()` alone was `undefined` → **£NaN** on fixture `1645882162449601`.
- **Claimant-response confirmation** on that fixture seeds `applicant1ResponseDate` and a signed settlement agreement so the panel is not `Invalid DateTime`.
- **Statement of means.** Claim `1645882162449605` is a defendant part-admit (**£400** of **£1,000**). WireMock CCD includes `specDefenceAdmittedRequired: No` so a CCD-only load still has `alreadyPaid`. The how-much / why-disagree guard optional-chains that field (missing answer redirects to the task list instead of 500). Empty amount inputs use `default('')` so they are blank, not the string `undefined`.
- **Who employs you?** Employer name and job title sit in one page-level `govuk-grid-column-two-thirds`. Nested `govuk-grid-column-*` without a `govuk-grid-row` was indenting the inputs.
- **Case progression** `1645882162449603` is `FAST_CLAIM` with trial-arrangement answers, a **60-minute** hearing, and Help with Fees reference `HWF-A1B-23C`.
- **View the response to the claim / Orders and notices.** `formatDateToFullDate` returns `''` for missing or invalid dates (never `Invalid DateTime`). Core Case Data (CCD) ISO strings such as `respondent1ResponseDate` are converted with `new Date(...)`. The document hint uses `respondent1ResponseDate` or the DEFENDANT_DEFENCE `createdDatetime`, passed into `addCreateFileInformation` **without** wrapping in `t()` (that interpolation was **Created []**). The page shows a **Created** hint with the defence date; the square brackets in that copy are intended.
- **Messages to the court** (`/case/1645882162449603/qm/view-query`). The same claim seeds **ten** query-management parent threads (four sent, four response received, two closed) so the table is not empty. Subject links open query details.
- **General application** `1645882162449604` seeds a **strike-out** draft (hearing contact, Certificate of Satisfaction or Cancellation (COSC) payment date, application fee **10800** pence). Submit confirmation without `?appFee=` (including COSC `/general-application/cosc/submit-general-application-confirmation`) uses that draft fee so the copy is **£108**, not `£NaN`. The pay URL omits `appFee` when the value is not finite. GET handlers use `applicationTypeIndexFromQuery` so a missing `applicationTypes` array does not 500; the fee API is skipped rather than interpolating `£NaN`.
- **View mediation settlement agreement** on `1645882162449409` seeds a `mediationAgreement` PDF. The mapper returns an empty documents table when CCD omits the file.
- **Respondent agreement** sets `{% block pageTitle %}` and `getRespondToApplicationCaption` maps CCD labels (or falls back to **Respond to an application**) so the heading is not `PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO.undefined` overlapping Contact us. The GA WireMock case stores `applicationTypes` as the CCD label **Strike out** so **My applications** is not `APPLICATION_TYPE_CCD.undefined`.

WireMock also stubs court locations, Ordnance Survey postcode lookup, airlines, fee ranges, general-application fees, `POST /fees/claim/calculate-interest`, `POST /cases/response/deadline`, the general-application case `1732194111758649`, and a sample dashboard task list. Mapping files: `ui-preview-claims.json`, `ui-preview-full-admit.json`, `ui-preview-part-admit.json`, `ui-preview-case-progression.json`, `ui-preview-ga.json`, `ui-preview-som.json`, `ui-preview-shared-apis.json`.

Preview mappings live in `compose/ui-preview-mappings/`, separate from Helm chart WireMock contracts, so browsing fixtures does not weaken the reduced-stack validator’s “no broad matchers” rule. Shared stubs include `POST /fees/claim/calculate-interest` (so **Why do you disagree** and similar totals do not fail when the draft claims interest) and `POST /cases/response/deadline`. In preview, the header homepage link stays inside the app instead of sending the user to gov.uk.

Designers, researchers, and developers can iterate on Nunjucks and GOV.UK markup in minutes, offline from HMCTS networks.

---

## What you look at is the Design System, not a lookalike

The service’s stated user interface (UI) source of truth is **GOV.UK Frontend**. This fork moved the pin **6.2.0 →** the then-current release and keeps tracking the [latest GitHub release](https://github.com/alphagov/govuk-frontend/releases/latest) (exact pin only in `package.json`). Upstream still ships eighteen view files with hand-written `govuk-table`, `govuk-inset-text`, `govuk-header`, or `govuk-button` markup. I converted those, plus the preview catalogue — **nineteen** Nunjucks templates. Shared `item-content.njk` is imported by **fifty-nine** other screens, so one table/inset/button conversion reaches confirmation, upload, and content pages across claim, response, case progression, general application, mediation, and query management.

I then put the remaining high-traffic components on the same official macros. Claim summary uses `govukTabs` (Design System keyboard and selected-state behaviour, including the official Contents heading). Query lists use `govukTable`. General-application and query uploads share `uploaded-files-summary.njk`; query threads use `query-message-card.njk` with Frontend 6 summary cards. Find address is `govukInput` and `govukButton` (default submit); progressive enhancement still intercepts the click for the postcode lookup (`fetch`, not jQuery). The paper-form postal address is `govukInsetText`.

I then removed leftover lookalike **fieldsets** around `govukRadios` / `yesNoRadioButton` (nested fieldsets — `govukRadios` already emits one) and stopped stuffing extra `govuk-error-message` markup inside `govukDateInput` `errorMessage.html` (the date macro already wraps that). Contact-us always-open help uses `govukDetails` with `open: true`. Claim, response, claimant-response, and dashboard task lists use `govukTaskList` (with `app-task-list__item` kept as a locator class for existing Codecept checks). Item arrays are built in TypeScript (`govukTaskListItems.ts`) because Nunjucks cannot parse `{% set x = [{...}] %}`. Unused `macro/task.njk` was deleted. Yes/no legends must be a **string** `title` plus `isPageHeading` / `legendClasses` — not nested heading HTML. That work touches the shared macros plus on the order of **one hundred** journey templates (eligibility, claim, response, statement of means, directions questionnaire, claimant response, case progression, general application, mediation, query management). **Who employs you?** no longer nests `govuk-grid-column-*` around `govukInput` (those columns add gutters unless they sit in a `govuk-grid-row`), so employer name and job title line up with the heading and buttons.

That is cheaper than it sounds. GOV.UK HTML, CSS, and JavaScript live in the package. A pin bump plus `yarn test:govuk-fixtures` absorbs structure changes — service navigation, table captions, button `rel` for new tabs, summary cards — instead of rewriting lookalike markup page by page. Citizens see the same GOV.UK look as other government services because the markup **is** the Design System output. Focus order, labels, keyboard behaviour (including tabs), and table structure come from Frontend (Web Content Accessibility Guidelines (WCAG) 2.2 AA). I prefer GOV.UK over axe when they conflict; macros keep that policy honest.

The fixture suite (`src/test/unit/govukFrontend/`) renders every official component through this app’s Nunjucks environment and compares HTML to the package `fixtures.json` — **692** assertions across **37** components. Upstream has none. Copy-pasted classes cannot be checked that way. Service Standard points 4 and 13 (“look like GOV.UK”) are easier to defend when the HTML is the Design System’s.

Pa11y 9 scans every citizen GET in `urls.ts` that has a matching HTML mock (hundreds of fixtures), not three core pages. Routes without a view, external links, hash fragments, and pages still missing a mock stay in `ignored-urls.ts`. HTML_CodeSniffer codes that conflict with official GOV.UK tables and headings are ignored in Pa11y options — we do not drop those pages or rewrite macros. A green mock run is still not a full Web Content Accessibility Guidelines (WCAG) 2.2 AA audit.

---

## Local commands tell the truth

Upstream `yarn test` echoes a Jest config path and executes **zero** tests. This tree runs the unit suite: **9,050** tests in **1,047** suites (25 August 2026 `yarn test:coverage`), via `node --no-sparkplug` on the Jest binary so Node 24 workers do not segmentation-fault (SIGSEGV) (Sparkplug plus Jest’s `vm` module). Coverage still uses `--maxWorkers=8` for memory.

Those tests are not a single-folder spike. Versus upstream at `5351e5b603` there are **203** extra unit files (**+24%**) and **1,478** extra `it()` cases (**+23%**) (a grep of `it()`, not Jest’s full test count): 82 in forms and validators, 80 in journey services, 12 in client JavaScript, the rest in modules, routes, HTTP clients, preview catalogue, and the `govukTaskList` item filter. **All thirteen** client JS modules now have a paired unit file (upstream had one). Latest `yarn test:coverage` on every `src/main` TypeScript and JavaScript file except webpack output is **97.81%** statements, **87.59%** branches, **98.58%** functions, **97.75%** lines, with a continuous integration (CI) floor of **97 / 86 / 97 / 97**. Journey services sit in the mid-90s to 100% on statements and lines. Branches remain the hardest metric; after MoJ removal the weak client-JS spot is `add-another.js`, covered in `src/test/unit/assets/js/add-another.test.ts` (clone / remove / mediation no-op) rather than by lowering that floor or pinning glob 13. Jest 29 `CoverageReporter` needs CommonJS `glob.sync`; this tree nests `@jest/reporters/glob` at `7.2.3` so a glob 13 (ECMAScript Modules) hoist cannot fail the run after green suites.

Upstream coverage only reports files a test already imported, and has no floor. An untested controller here counts as zero and can fail the run. `yarn test:a11y` used to echo that accessibility ran in GitHub Actions — it does not; Pa11y is Jenkins `tests:a11y:parallel` — and that stub always passed. I aliased it to the real Pa11y command and **dropped it from `yarn cichecks`**, so a green aggregate run cannot pretend accessibility ran. `cichecks` still builds, lints, covers, runs route integration, civil-shared import consumers, functional-test classification, WireMock checks, then `yarn deps:check` and `yarn deps:audit`.

ESLint is **10** (flat config). Sass-loader **17** keeps GOV.UK Sass resolving. Playwright specs have their own `tsconfig.json` so they type-check without clashing with Jest globals. CodeceptJS 4, WebdriverIO 9, Playwright 1.62, and Pact 17 are on maintained majors; they still need a dedicated AAT or preview functional run.

The effect is practical: form, client, middleware, translator, and calculator regressions are more likely to fail in Jest on the laptop, instead of only in AAT.

---

## Installs stay the version you reviewed

**89%** of upstream `package.json` specifiers were version ranges. This tree has **none**. Every `dependencies` and `devDependencies` entry is an exact pin (upstream: **9%**). `yarn.lock` stores a SHA-512 (Secure Hash Algorithm) checksum per npm tarball; `.yarnrc.yml` sets `checksumBehavior: throw`. A 7-day npm age gate (`npmMinimalAgeGate: 10080`) waits out the unpublish window and typical public reporting lag. Security fixes may set `YARN_NPM_MINIMAL_AGE_GATE=0` for one command.

Ranges let a later install pull different code without a reviewed bump — compromised patches, protestware, packages that later add telemetry. Checksums stop a same-version archive swap. `yarn deps:check` and Yarn hardened mode in GitHub Actions enforce that in CI.

Pins are not a Common Vulnerabilities and Exposures (CVE) scan. Upstream documents `yarn npm audit` but does not run it in CI. `yarn deps:audit` requires a clean **production** tree (no allowlist) and an exact match for toolchain lines in `yarn-audit-known-issues`. It runs in `cichecks` and `ci.yml`. A new production advisory fails the build until the package is upgraded.

Renovate extends HMCTS `automerge-minor` (not `automerge-all`), pins ranges, waits seven days, and does not automerge majors or `govuk-frontend`. Its pull requests run pin check, audit, and coverage. The pin policy holds when nobody is watching the bot.

I lifted transitive noise on purpose: `tar` 7.5.22, `flat` 6.0.1, `formidable` 3.5.4, `node-fetch` 3. First-contact personal identification number (PIN) encryption uses Node `crypto` instead of `crypto-js`, keeping OpenSSL `Salted__` output so in-flight sessions still decrypt. Helmet is **8.3.0** with tests that referrer-policy is required and Content Security Policy (CSP) nonce callbacks run. GitHub Actions `uses` entries are on current majors (checkout / setup-node **v7**, stale **v11**). Rate-limit-redis 6 and ioredis 6 stay on maintained clients; Redis Serialization Protocol version 3 (RESP3) against platform Redis still wants an AAT smoke test.

Personally identifiable information (PII) Semgrep and Playwright API-security specs already exist upstream. I documented them and gave the Playwright specs a typed project so a security `expect` is not “fixed” with Jest’s.

---

## Telemetry and the compiler sit on supported majors

Application Insights software development kit (SDK) **3.16.0** needs a connection string (bare Key Vault instrumentation keys are wrapped), config before `start()`, Promise `flush()`, and a supported sampling API. Non-prod (`LAUNCH_DARKLY_ENV !== prod`) samples at 100% so diagnosis is not silently dropped; production sampling stays the SDK default. LaunchDarkly is **9.13.0** in `package.json`. `@hmcts/properties-volume` is **1.4.1**.

TypeScript is **6.0.3** with documented transitional flags (`strict: false` on purpose). i18next is **26**. `uuid` 14 is ECMAScript modules (ESM); Jest transforms it instead of blocking the upgrade. App asset JS no longer imports jQuery (`postcode-lookup.js` / `select-toggle.js` use native DOM and `fetch`). jQuery and MoJ Frontend are not dependencies. The webpack 7-era loaders stay installable on Node 24.

I assessed a few majors and **left them blocked** — `config` 5 (hundreds of CommonJS `require`s), `connect-redis` 10 (drops ioredis), Babel 8 with Jest 30. `@ministryofjustice/frontend` was **removed** (Add another is app JS). Handover: [docs/moj-frontend.md](docs/moj-frontend.md). Those reasons also live in the [21 August dependency update log](docs/dependency-update-log-2026-08-21.md) and the earlier [18 August log](docs/dependency-update-log-2026-08-18.md). Completable, tested upgrades beat a single explosive toolchain migration.

Citizen journeys stay the same shape: controllers, services, GOV.UK macros. The application-layer diff is preview routes, `cryptoAes`, Insights flush, Nunjucks preview globals, and compiler layout — not a parallel framework.

---

## People can find how the app works

Upstream `docs/` is four specialised notes (WireMock, PII Semgrep, functional-test diagnostics). I wrote a human guide of **twenty-three** files and about **8×** the line count (**2,147** lines vs **269**): architecture, local development, citizen journeys, frontend, integrations, security, testing, CI, contributing, MoJ Frontend handover, and a [service assessment](docs/service-assessment.md) snapshot (14 Service Standard points, Technology Code of Practice (TCoP), HMCTS Express server-side rendering stack, Design System fixture HTML). The root README points at that hub. Node in the README matches `engines` / `.nvmrc` (`>=24.18.0`) instead of an obsolete Node 14 line.

Upstream has no `AGENTS.md`. I added vendor-neutral standing conventions — Yarn 4, GOV.UK macros, Express/TypeScript stack, exact pins, no invented ticket keys, no Artificial Intelligence (AI) agent git identity — so Copilot, Claude, Codex, Cursor, or a human follow the same rules. [`ai-docs/`](ai-docs/README.md) is a **34**-page directory mirror, script catalogue, and deviation checklist (**1,727** lines plus **235** in `AGENTS.md`). Conventions are not stored as Cursor `.mdc` files. Structured guidance (`docs/` + `ai-docs/` + `AGENTS.md`) is about **15×** the upstream specialised-notes line count.

Agents can recommend against a citizen Single Page Application (SPA) — a React- or Angular-style app that updates the page in the browser instead of this Express + Nunjucks service sending HTML — or against hand-rolled GOV.UK HTML or unexplained Artificial Intelligence (AI), because the assessment bar is in the repo, not only in someone’s head.

---

## What is still open

These are honest gaps, not hidden work:

1. Confirm **ioredis 6 / Redis Serialization Protocol version 3 (RESP3)** against platform Redis in AAT (legacy reply shapes are preserved in this pin).
2. A tagged **CodeceptJS 4 / WebdriverIO 9** run on preview or AAT. Reduced-stack browser selection is `@reduced-stack` — see [docs/functional-test-migration-matrix.md](docs/functional-test-migration-matrix.md).
3. TypeScript **`strict` remains false**; turning it on is a separate, large effort.
4. The preview OpenID Connect (OIDC) allowlist is intentional for `e2eTest` and must not be copied into production path policy.

This tree is rebased onto `hmcts/master` `5351e5b603` and includes the Camunda import-consumer scripts, functional-test classification check, draft-claim Redis time to live (TTL) of **30** days (`journeyCache` / `gaJourney` stay 180), postcode-lookup exceptions, and the CVE resolution pins from that SHA.

---

## In numbers

Like-for-like extras vs `hmcts/master` at `5351e5b603` (unit files, `it()` grep) were computed at that SHA. This-tree absolute counts (Jest run, coverage, `docs/` / `ai-docs/` lines, pins, `src/main` loc, Yarn scripts) are as of **25 August 2026**. Percentages are file, specifier, and test counts — not estimated hours saved or a claim that the live service is “X% more secure”. Upstream Codecov currently publishes **unknown**. PII Semgrep exists upstream and is not counted as a gain here. `yarn.lock` churn is omitted from the prose counts above.

| | Upstream (`5351e5b603`) | This tree |
| --- | --- | --- |
| `yarn test` | Echoes a config path (0 tests) | **9,050** tests / **1,047** suites |
| Unit test files (last compare) | 845 | 1,048 (**+24%**) |
| `it()` cases (last compare grep) | 6,400 | 7,878 (**+23%**) |
| Client JS modules with a paired unit file | 1 / 13 | 13 / 13 |
| GOV.UK `fixtures.json` HTML assertions | 0 | 692 (37 components) |
| Hand-written header/table/inset/button views | 18 templates | 0 (19 converted, including preview) |
| Nested radios fieldsets / date-error lookalikes / hand-rolled task lists | present | `govukRadios` once; `govukDateInput` error HTML; `govukTaskList` via TypeScript items |
| UI Preview Ready GET links | absent | **316** (grow by fixing 500s / empty interpolations, not a count target) |
| `package.json` version ranges (`dependencies` + `devDependencies`) | 151 / 169 (**89%**) | **0 / 121** |
| Exact pins (`dependencies` + `devDependencies`) | 9% | 100% |
| Human `docs/*.md` | 4 files, 269 lines | **23** files, **2,216** lines |
| `AGENTS.md` + `ai-docs/` | absent | **237** + **1,732** lines |
| `src/main` TypeScript/JavaScript (excl. public) | 72,153 | **73,303** (**+1.6%**) |
| Coverage (stmts / branch / funcs / lines) | not published | **97.81% / 87.59% / 98.58% / 97.75%** |
| Yarn scripts | 56 | **63** runnable (`preview`, fixture tests, pin check, audit, classification, civil-shared import consumers) plus two `_comment:*` notes |

Method: last vs-upstream extras from two-dot `git diff hmcts/master` at the SHAs above; this-tree Jest/coverage from `yarn test:coverage` / `coverage/coverage-summary.json`; pin census from `package.json`; working-tree line counts excluding `src/main/public/`.

---

## Where to read next

1. [docs/README.md](docs/README.md) — how the service works ([glossary](docs/glossary.md) for acronyms)
2. [docs/service-assessment.md](docs/service-assessment.md) — Service Standard / TCoP / Design System mapped to this app
3. [AGENTS.md](AGENTS.md) and [ai-docs/README.md](ai-docs/README.md) — how to change it safely (portable; not tied to a particular editor)
4. [Dependency update log (26 August 2026)](docs/dependency-update-log-2026-08-26.md) — latest 7-day-cooldown pin bumps; earlier [21 August](docs/dependency-update-log-2026-08-21.md) and [18 August](docs/dependency-update-log-2026-08-18.md)

---

## Meeting readout — highlights and benefits

Written to be read aloud. Figures are versus `hmcts/civil-citizen-ui` `master`. The citizen product is unchanged: same journeys, same Express and Nunjucks stack. I changed how you can **see, test, secure, document, and upgrade** the service.

### One minute

This is still Civil Citizen UI. I did not rewrite the product. Application TypeScript and JavaScript grew by about one percent; unit tests grew by fifteen percent.

You can now look at the live GOV.UK interface on a laptop with Docker — no Identity and Access Management, no virtual private network, no civil-service backend. What you see is official Design System HTML, not copy-pasted lookalikes, so upgrades, branding, and accessibility travel with the GOV.UK Frontend package.

`yarn test` actually runs the unit suite — almost nine thousand tests. Upstream’s script runs none. Coverage is measured across the whole application tree, at about ninety-eight percent of statements, with a floor in continuous integration (CI).

Every package is an exact pin. Eighty-nine percent of upstream specifiers were floating ranges. Installs cannot silently change. A seven-day npm cooldown and a production audit in CI keep that honest.

People can find how the app works: a full human guide, standing conventions for any coding agent, and a service-assessment snapshot. That is this tree in one minute.

### Talking points

**1. Same product, better way of working.** Citizens still issue and respond to money claims the same way. I invested in tests, documentation, toolchain, and Design System HTML — not a parallel framework, and not a citizen Single Page Application. A Single Page Application, or SPA, is a React- or Angular-style app that runs in the browser and rewrites the page in JavaScript. This service stays Express and Nunjucks: the server sends HTML for each screen.

**2. You can look at the service on a laptop.** `yarn preview` starts Docker, WireMock, and fixture Redis. Designers, researchers, and developers iterate in minutes, offline from His Majesty’s Courts and Tribunals Service (HMCTS) networks. New catalogue links seed WireMock and Redis (or a production-safe fallback) — they do not fake copy in Nunjucks. Useful next GETs are screens that still 500 or look empty (`£NaN`, `Invalid DateTime`, `Created []`), not a push toward four hundred links. Full- and part-admit fixtures include a real instalment plan, so “How they want to pay” and “Your payment plan” are reviewable. Statement of means, trial arrangements, ten sample court messages, a strike-out general application, and the mediation settlement-agreement document have their own seeded claims.

**3. What you look at is GOV.UK, not a lookalike.** Frontend is on 6.4. Nineteen templates that used hand-written header, table, inset, or button markup now call official macros. A shared fragment carries that into fifty-nine other screens. I then put tabs, summary lists and cards, tags, Find address, the paper-form address, radios fieldsets, date errors, details, and task lists on the same macros — including TypeScript-built `govukTaskList` items, because Nunjucks cannot parse object-array literals. One pin bump plus the fixture suite absorbs Design System changes instead of rewriting pages. That is cheaper maintenance, aligned branding, and accessibility that comes from GOV.UK — focus, labels, keyboard including tabs, table structure. I prefer GOV.UK over axe when they conflict.

**4. I can prove the HTML matches the Design System.** Six hundred and ninety-two official fixture assertions, across thirty-seven components. Upstream has zero. Service Standard points about looking like GOV.UK are easier to defend when the markup is the Design System’s own output.

**5. Local test commands tell the truth.** Upstream `yarn test` echoes a config file and executes nothing. I run nine thousand and fifty tests in one thousand and forty-seven suites. Two hundred and three extra unit files at the last upstream compare — plus twenty-four percent — across forms, services, clients, modules, routes, and every client JavaScript file. Coverage on the whole `src/main` tree is ninety-seven point eight one percent statements, eighty-seven point five nine percent branches, ninety-eight point five eight percent functions, ninety-seven point seven five percent lines, with a continuous integration (CI) floor so a new untested file can fail the build. Form, calculator, and postcode regressions are more likely to fail on the laptop, not only in the HMCTS acceptance environment (AAT).

**6. Green CI means what it says.** Coverage counts every application file, not only files a test already imported. Accessibility is no longer a stub in `cichecks` that always passed while claiming Pa11y ran in GitHub Actions — it does not; Pa11y is Jenkins. Pin check and npm audit run in `cichecks` and GitHub Actions. A green run cannot hide untested files, a skipped accessibility suite, or an unaudited lockfile.

**7. Installs stay the version you reviewed.** Zero version ranges; upstream was eighty-nine percent ranges, nine percent exact pins. Lockfile SHA-512 (Secure Hash Algorithm) checksums fail a swapped tarball. New npm versions wait seven days unless I override for a security fix. Production audit must be clean — a new Common Vulnerabilities and Exposures (CVE) identifier fails CI. Renovate automerges minors only, never majors or GOV.UK Frontend, and its pull requests (PRs) run the same checks. The pin policy holds when nobody is watching the bot.

**8. Smaller, current security surface.** First-contact personal identification number (PIN) encryption uses Node’s own crypto, not a third-party library. Helmet 8 with tests around referrer policy and content-security-policy nonces. GitHub Actions on current majors. Known-noisy transitives lifted on purpose. Personally identifiable information scanning was already upstream; I made it discoverable and kept the Playwright security specs typed.

**9. Toolchain on supported majors, without an explosive rewrite.** TypeScript 6, ESLint 10, Node 24 Jest that actually finishes (Sparkplug workaround), Application Insights 3, LaunchDarkly 9, i18next 26 after app modules moved to native DOM; MoJ Frontend is not a dependency. Non-prod telemetry samples at one hundred percent so diagnosis is not silently dropped. I deliberately did **not** take config 5, connect-redis 10, or Babel 8 with Jest 30 — completable upgrades beat a single big-bang.

**10. People can find how the app works.** Human docs are about six times the file count and eight times the line count of upstream’s specialised notes. Standing conventions live in AGENTS.md so any person or coding agent follows the same rules — GOV.UK macros, Express and TypeScript, exact pins — not a particular editor. Thirty-four pages of directory context. A service-assessment snapshot so I can say no to a citizen Single Page Application or hand-rolled GOV.UK from the manuals, not from memory. Structured guidance is about fifteen times upstream.

### If you have thirty more seconds — what I am honest about

Redis 6 against platform Redis still wants an AAT smoke test. CodeceptJS 4 still needs a tagged functional run on preview or AAT. TypeScript strict mode is still off; turning it on is a separate piece of work. The preview login allowlist is for the laptop stack only and must not land in production. Local `master` is rebased onto `hmcts/master` `5351e5b603` (0 behind).

### Lines you can quote

- You can look at the live user interface (UI) on a laptop. No Identity and Access Management (IDAM), no virtual private network (VPN), no civil-service.
- Preview fixtures no longer show `£NaN`, `Invalid DateTime`, `Created []`, or an empty **Messages to the court** table.
- `yarn test` runs 9,050 tests. Upstream’s script runs none.
- Coverage: 97.81% statements across the whole application tree, with a CI floor.
- 89% of upstream package specifiers were floating ranges. This tree has none.
- 692 GOV.UK fixture assertions. Upstream has none.
- Application TypeScript and JavaScript plus 1.6% versus that upstream SHA. Same product.

---

## Key benefits if you use this tree

What you get if you look at this tree. Same citizen product; the journeys and Express + Nunjucks shape are unchanged.

| If you… | You get… |
| --- | --- |
| Want to see a page | `yarn preview` — live GOV.UK user interface (UI) on a laptop, no Identity and Access Management (IDAM), virtual private network (VPN), or civil-service. Catalogue GETs seed fixtures (or a production fallback); grow by fixing 500s and empty interpolations |
| Need claimant-response screens | Full- and part-admit fixtures with an instalment plan, so **How they want to pay** shows amount, frequency, and dates; **Your payment plan** shows **10 months**; **Court offered set date** is populated; settle-admitted is not `£NaN` |
| Need statement of means, trial arrangements, or a general application | Seeded claims `1645882162449605` (part admit £400 of £1,000), `1645882162449603` (`FAST_CLAIM`, 60-minute hearing, ten court-message threads), `1645882162449604` (strike-out draft; confirmation **£108** without `?appFee=`) |
| Need **Messages to the court** or query details | Case `1645882162449603` seeds ten parent threads (sent, response received, closed); details id `qm-9603-hearing` |
| Need **View the response to the claim** | `respondent1ResponseDate` plus a DEFENDANT_DEFENCE PDF → a **Created** hint with the defence date, not `Created []` |
| Worry preview stubs will break reduced-stack | Preview mappings live in `compose/ui-preview-mappings/` (seven JSON files), separate from Helm chart WireMock contracts |
| Iterate Nunjucks offline | Designers and developers can work without Core Case Data (CCD), IDAM, or a tunnel into the His Majesty’s Courts and Tribunals Service (HMCTS) acceptance environment (AAT) |
| Touch header, table, inset, or button markup | Official GOV.UK macros on **19** templates; shared `item-content.njk` carries that into **59** other screens |
| Touch tabs, tags, summary lists, Find address, radios, dates, or task lists | Official `govukTabs`, `govukTag`, `govukSummaryList`, `govukRadios` (one fieldset), `govukDateInput`, `govukTaskList` (TypeScript item arrays), `govukDetails`, `govukInput`, and `govukButton` |
| Edit upload or query summaries | Shared `uploaded-files-summary.njk` and `query-message-card.njk` — one fragment change updates every caller |
| Upgrade GOV.UK Frontend | Pin bump + `yarn test:govuk-fixtures` (**692** assertions, **37** components). Upstream has **none** |
| Defend “look like GOV.UK” | Markup **is** Design System output. Service Standard 4 and 13 are easier to argue |
| Care about accessibility | Focus, labels, keyboard (including tabs), and table structure come from GOV.UK Frontend (Web Content Accessibility Guidelines (WCAG) 2.2 AA). GOV.UK wins if axe disagrees |
| Run unit tests | `yarn test` executes **9,050** tests in **1,047** suites. Upstream’s script runs **none** |
| Compare test volume | **+203** unit files (**+24%**) and **+1,478** `it()` cases (**+23%**) vs upstream at `5351e5b603`, across forms, services, clients, modules, routes, and client JS |
| Change client JavaScript | All **13** `src/main/assets/js/` modules have a paired unit file (upstream had **1**) |
| Care about coverage | **97.81%** statements / **87.59%** branches / **98.58%** functions / **97.75%** lines on the whole `src/main` tree |
| Add an untested controller | It counts as zero. Continuous integration (CI) floor **97 / 86 / 97 / 97** can fail the build |
| Trust `yarn test:coverage` | It measures every application file, not only files a test already imported |
| Trust `yarn cichecks` | Builds, lints, covers, route integration, civil-shared import consumers, functional-test classification, WireMock, pin check, and audit. Accessibility is **not** a stub that always passed |
| Run accessibility locally | `yarn test:a11y` scans every mocked citizen GET (Jenkins still runs `tests:a11y:parallel`). A green mock run is not a WCAG 2.2 AA audit |
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
| Send telemetry | Application Insights software development kit (SDK) **3.16.0**; non-prod samples at **100%** so diagnosis is not silently dropped |
| Use feature flags or Key Vault | LaunchDarkly **9.13.0**; `@hmcts/properties-volume` **1.4.1** |
| Compile TypeScript | **6.0.3** with documented transitional flags (`strict: false` on purpose) |
| Use i18n or ESM packages | i18next **26**; `uuid` 14 transformed in Jest instead of blocking the upgrade |
| Bump webpack / jQuery | App JS is jQuery-free; MoJ Frontend is not a dependency ([docs/moj-frontend.md](docs/moj-frontend.md)); webpack 7-era loaders installable on Node 24 |
| Wonder why some majors were skipped | Reasons recorded (`config` 5, `connect-redis` 10, Babel 8 + Jest 30) — completable upgrades, not a big-bang. MoJ Frontend was removed rather than upgraded. |
| Onboard someone | Human `docs/` is **23** files / about **8×** the line count of upstream’s specialised notes, plus a glossary |
| Ask an agent or a human to change code | `AGENTS.md` — same rules for Copilot, Claude, Codex, Cursor, or a person (not Cursor-only `.mdc` files) |
| Need directory-level context | **34** `ai-docs/` pages: mirror, playbooks, script catalogue, service-assessment deviation checklist |
| Judge a stack or UI proposal | Service Standard / Technology Code of Practice (TCoP) snapshot — say no to a citizen Single Page Application (SPA) or hand-rolled GOV.UK from the manuals |
| Read the README Node line | Matches `engines` / `.nvmrc` (`>=24.18.0`), not an obsolete Node 14 line |
| Look at application source size | `src/main` TypeScript/JavaScript **+1.6%** lines versus that upstream SHA. The extra code is tests, docs, preview fixtures, app Add another JS, and toolchain — not a rewrite |
