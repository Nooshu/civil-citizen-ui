# Frontend recommendations (Civil Citizen UI)

Standing recommendations for the His Majesty’s Courts and Tribunals Service (HMCTS) **Civil Citizen UI** (CUI) frontend. They capture what this fork completed and what to do next. Canonical rules remain [`AGENTS.md`](AGENTS.md). Day-to-day reference: [`docs/frontend.md`](docs/frontend.md). Service Standard / Design System / Government Digital Service (GDS) bar: [`docs/service-assessment.md`](docs/service-assessment.md).

**Stack (do not replace):** Express + TypeScript + Nunjucks + **GOV.UK Frontend** server-side rendering. Do not introduce a citizen Single Page Application (SPA).

---

## 1. GOV.UK Frontend is the single source of truth

Track the **latest** [GOV.UK Frontend release on GitHub](https://github.com/alphagov/govuk-frontend/releases/latest). Pin that exact version in `package.json` (no ranges). Upgrade promptly after the 7-day cooldown unless a security fix requires sooner. Do not leave the pin months behind the latest release without a documented reason.

| Do | Do not |
| --- | --- |
| Import official Nunjucks macros (`{% from "govuk/components/.../macro.njk" import … %}`) | Hand-write `govuk-button`, `govuk-header`, `govuk-table`, `govuk-inset-text`, `govuk-tabs`, `govuk-summary-list`, `govuk-tag`, `govuk-fieldset`, `govuk-error-message`, `govuk-details`, `govuk-task-list`, footer, skip link, or breadcrumbs |
| Use typography/layout utilities (`govuk-heading-*`, `govuk-grid-*`, `govuk-!-*-*`) for composition | Fork `node_modules/govuk-frontend` or vendor-copied CSS/JS |
| Theme in `src/main/assets/scss/` only | Rebuild Design System HTML in client JavaScript |
| Prefer GOV.UK output when axe / axe-core disagrees (disable the scanner rule) | Rewrite GOV.UK markup to silence axe |

**Completed in this fork:** hand-written header/table/inset/button views converted to macros (**19** templates, including the preview catalogue). Shared `item-content.njk` carries table/inset/button macros into **59** other screens.

---

## 1a. Government Digital Service (GDS) compliance — frontend assessment

Assessors examining **frontend code** judge Government Digital Service (GDS) expectations via the [Service Standard](https://www.gov.uk/service-manual/service-standard) (especially points **4**, **5**, **11**, **13**), [Making your service look like GOV.UK](https://www.gov.uk/service-manual/design/making-your-service-look-like-govuk), the [GOV.UK Design System](https://design-system.service.gov.uk/), and [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/). Full mapping: [`docs/service-assessment.md`](docs/service-assessment.md).

**What the development team must do** so frontend code stands up in an assessment:

| Requirement | Concrete evidence in this repo |
| --- | --- |
| **Look like GOV.UK** | Official macros for Design System components; GOV.UK typography/layout utilities only for composition; phase banner / content style in locales |
| **Stay on current Frontend** | Exact pin matches (or is close to) the [latest GitHub release](https://github.com/alphagov/govuk-frontend/releases/latest); upgrade checklist completed |
| **HTML matches the Design System** | `yarn test:govuk-fixtures` green after every Frontend / Nunjucks-env change ([fixture HTML guidance](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files)) |
| **Progressive enhancement** | Server-rendered Nunjucks first; app JS only enhances macro DOM; `initAll()` from `govuk-frontend`; forms usable without JS where the journey allows |
| **Accessibility (WCAG 2.2 AA)** | Keep skip link, labels, error summaries, focus, keyboard (including tabs) from macros; run `yarn tests:a11y`; do not break GOV.UK to silence axe |
| **No citizen SPA / lock-in** | Express + Nunjucks SSR — not React/Vue/Angular for citizen journeys ([HMCTS stack](https://hmcts.github.io/standards/technology-stack/)) |
| **Document divergences** | If a page cannot use a published pattern, record **why** and any research; assessors ask where you diverged |
| **Secure frontend delivery** | CSP nonces for GOV.UK / third-party scripts; no `unsafe-inline`; CSRF on POSTs |

Do **not** claim the service “passes” from git alone. Do use this table in pull request / assessment prep when the change touches views, assets, or `govuk-frontend`.

---

## 2. Official macros for every Design System component

Use macros for layout chrome and journey UI:

- Header / service navigation, footer, skip link, breadcrumbs, pagination
- Table, inset text, button, tabs, summary list / summary cards, tag
- Radios, checkboxes, date input, details, task list, error summary, input

### Patterns already fixed (keep them)

| Pattern | Recommendation |
| --- | --- |
| Radios / yes–no | One fieldset only — `govukRadios` already emits one. Do not wrap `govukRadios` or `yesNoRadioButton` in a second `<fieldset>`. Pass a **string** `title` plus `isPageHeading` / `legendClasses`; never nested heading HTML as `title` (that can 500). |
| Date errors | Put the message in `govukDateInput` `errorMessage`; do not stuff extra `govuk-error-message` markup into `errorMessage.html`. |
| Task lists | Use `govukTaskList`. Build item arrays in TypeScript (`govukTaskListItems.ts` / Nunjucks filters) — Nunjucks cannot parse `{% set x = [{...}] %}`. Keep `app-task-list__item` as a locator class for Codecept if needed. Delete hand-rolled task-list macros. |
| Details | Contact-us always-open help uses `govukDetails` with `open: true`. |
| Summary cards | Query threads use `query-message-card.njk` with Frontend summary cards, not hand-written card chrome. |
| Grid columns | `govuk-grid-column-*` only inside a `govuk-grid-row`. Nested columns without a row indent inputs (fixed on **Who employs you?** / `employer.njk`). |

### Extract shared fragments

If the same block appears on two journeys, extract under `src/main/views/macro/` or `features/common/`. Examples already shared: `uploaded-files-summary.njk`, `query-message-card.njk`, `item-content.njk`, `yesNoGenericForm.njk`, `postcode-address-form.njk`.

---

## 3. Progressive enhancement (not client-rendered GOV.UK)

1. Server renders complete, usable HTML via Nunjucks macros.
2. App JS in `src/main/assets/js/` **enhances** that markup (show/hide, populate selects, calculators, prevent double submit).
3. Forms must work without JavaScript where the journey allows a full POST.
4. Always call `initAll()` from `govuk-frontend` after app imports (`src/main/index.js`), then `initAddAnother()` (which also starts `initAppendRow`; `append-row.js` is not a separate entry import).

Examples already in the tree:

| Module | Enhancement |
| --- | --- |
| `postcode-lookup.js` | AJAX address lookup; Find address remains a normal `govukButton` submit if JS fails |
| `append-row.js` | Clone `.row-container` / `.append-row` markup (`initAppendRow`, started from `initAddAnother`) |
| `add-another.js` | Client clone for evidence / court orders / case-progression uploads (`cui-add-another*` + `.cui-add-another__items`); also starts `initAppendRow` |
| `reindex-add-another-actions.js` | Reindex `action[add\|remove][…]` names after a client clone |
| `calculate-amount.js` / `calculate-total-amount.js` / `calculate-length-repayment.js` | Live totals / repayment length without a round-trip |
| `disable-submit.js` | Prevent double POST |
| `select-toggle.js` | Show/hide panels from a select |

**Repayment length:** run when `document.readyState` is `complete`, not only on `window` `load`, so pre-filled instalment forms show the schedule without waiting for a late load event.

Do not construct GOV.UK component HTML strings in JavaScript. Show, hide, or fill **already macro-rendered** DOM.

---

## 4. HTML fixture accuracy (`yarn test:govuk-fixtures`)

Prove macros match the Design System release:

```bash
yarn build
yarn test:govuk-fixtures
```

The suite (`src/test/unit/govukFrontend/`) renders every official component through this app’s Nunjucks environment and compares HTML to the package `fixtures.json` — **692** assertions across **37** components. Upstream has none.

After every `govuk-frontend` pin bump:

1. Absorb HTML/CSS/JS fallout via macros (not vendor forks)
2. `yarn build`
3. `yarn test:govuk-fixtures` (must pass)
4. Focused Jest + `yarn test` as needed
5. `yarn tests:a11y` where practical
6. Spot-check home, claim issue, response, dashboard
7. Update version notes in README / `docs/` / `AGENTS.md` so they still point at the [latest release](https://github.com/alphagov/govuk-frontend/releases/latest) and the exact pin in `package.json`

Renovate / Dependabot GOV.UK bumps are incomplete until those checks pass.

---

## 5. App JavaScript is jQuery-free (MoJ Frontend is not a dependency)

**Done:** App modules under `src/main/assets/js/` use native DOM / `fetch`. `jquery`, vendored `mojAll.js`, and `@ministryofjustice/frontend` are **removed**. Repeatable evidence / court-order / upload rows use [`src/main/assets/js/add-another.js`](src/main/assets/js/add-another.js) and the `cui-add-another*` markup prefix. Timeline, expenses, employers, and directions questionnaire use the same `initAddAnother()` call via `initAppendRow` (`.row-container` / `.append-row`). A 10.0.1 pin was built first; package Sass cannot load beside GOV.UK `@import`, so the package was dropped instead of kept as a second design system. Handover: [`docs/moj-frontend.md`](docs/moj-frontend.md).

### Recommendations

1. **No new jQuery in app modules.** Progressive-enhancement scripts use `document.querySelector` / `querySelectorAll`, `addEventListener`, `fetch`, and GOV.UK Frontend APIs only.
2. **Do not reintroduce jQuery** or `@ministryofjustice/frontend` / `moment` to restore Add another.
3. **Do not expand MoJ coupling** (no MoJ header, date picker, filters). GOV.UK Frontend is the design system.
4. **Keep webpack ESM.** App asset JS should remain importable modules (`import` / `export`).

---

## 6. Client JavaScript and SCSS hygiene

- App behaviour lives only in `src/main/assets/js/`. Import new files from `src/main/index.js` **or from a module that entry already imports** (for example `append-row.js` via `add-another.js`) or they will not ship in `main`.
- Cookie config is a **second** webpack entry (`modules/cookie/cookieConfig.ts` → `cookies` bundle).
- Pair every asset JS module with a unit test (`src/test/unit/assets/js/`). This fork has **13 / 13** modules covered (upstream had one).
- SCSS: `main.scss` imports GOV.UK Frontend; overrides in app files only. Keep `sass-loader` `loadPaths` so GOV.UK Sass resolves after sass-loader 17.
- Avoid extra bundles and blocking scripts. Prefer server-rendered HTML for Largest Contentful Paint (LCP).
- Third-party scripts (Dynatrace, Google Tag Manager, web chat) stay nonce’d under Content Security Policy (CSP); do not add `unsafe-inline`.

---

## 7. Accessibility (WCAG 2.2 AA)

- Preserve skip link, labels, error summaries, focus order, and keyboard behaviour from GOV.UK macros (including tabs).
- Do not “fix” axe by breaking GOV.UK structure.
- Pa11y: `yarn tests:a11y` (alias `yarn test:a11y`). Jenkins runs `tests:a11y:parallel`. Not part of `yarn cichecks` — a green aggregate run must not pretend accessibility ran. The mock harness scans every `urls.ts` citizen GET that has a fixture; GOV.UK macros win if HTML_CodeSniffer or axe disagrees. A green mock run is not a full WCAG 2.2 AA audit.
- Functional journeys should stay keyboard-usable.

---

## 8. Internationalisation (i18n)

- User-visible strings: English **and** Welsh (`en.json` / `cy.json`) in the same change.
- Use `t('…')` in Nunjucks and content builders — do not hard-code citizen copy in controllers or templates to “fill” preview.
- Never interpolate a missing enum into an i18n key (`RESPOND_TO.${undefined}`). Map Core Case Data (CCD) labels or fall back to a safe string.
- Do not wrap an **already formatted** date in `t()` (that yields `Created []`).

---

## 9. Useful pages, not empty HTML 200s

Catalogue and preview GETs must be **useful** to a citizen, not only HTTP 200.

| Symptom | Treat as |
| --- | --- |
| Empty table | Missing CCD / Redis seed (for example `queries.caseMessages`) |
| `£NaN` | Wrong amount helper or missing fee fallback |
| Luxon `Invalid DateTime` | Missing/invalid date; formatters must return `''` |
| `Created []` | Date missing, invalid, or passed through `t()` |
| `PAGES.…undefined` | Broken i18n key / missing page title block |

Seed WireMock (`compose/ui-preview-mappings/`) **and** Redis (`uiPreviewRedisData.json`) when the journey reads both. Prefer production-safe fallbacks over preview-only Nunjucks hacks. Checklist: [`ai-docs/playbooks/ui-preview-missing-data.md`](ai-docs/playbooks/ui-preview-missing-data.md). Look at pages with `yarn preview` → **http://localhost:3001/ui-preview**.

---

## 10. Stay on the HMCTS citizen stack

| Prefer | Avoid |
| --- | --- |
| Express controllers + Nunjucks | NestJS, React, Vue, Angular, or a second template engine |
| Progressive enhancement on macros | A citizen SPA that owns routing and UI |
| GOV.UK Frontend pin bumps + fixtures | Lookalike HTML that drifts from the Design System |
| Exact dependency pins | Floating ranges that silently change frontend packages |

Reasons and Technology Code of Practice (TCoP) mapping: [`docs/service-assessment.md`](docs/service-assessment.md), [`ai-docs/service-assessment.md`](ai-docs/service-assessment.md).

---

## 11. Upgrade and change checklist (frontend)

When changing Nunjucks, macros, assets, or `govuk-frontend`:

```bash
yarn build
yarn test:govuk-fixtures   # after Frontend / Nunjucks-env changes — must pass
yarn test -- src/test/unit/assets/js/   # if client JS changed
yarn lint
# where practical:
yarn tests:a11y
```

Also update: human `docs/frontend.md`, GOV.UK Frontend notes in `AGENTS.md` / README (link the [latest release](https://github.com/alphagov/govuk-frontend/releases/latest); keep the exact pin only in `package.json`), and matching `ai-docs/` mirror pages in the same change.

---

## 12. What this fork already delivered (frontend)

Use this as the baseline; new work should extend it, not undo it.

1. GOV.UK Frontend as UI source of truth (exact pin; track the [latest release](https://github.com/alphagov/govuk-frontend/releases/latest))
2. Macro conversion of hand-written chrome + shared `item-content.njk`
3. Tabs, tables, summary lists/cards, Find address, details, radios fieldsets, date errors, task lists on official macros
4. `yarn test:govuk-fixtures` (**692** assertions / **37** components)
5. Progressive enhancement kept (postcode `fetch`, row cloning, calculators) on macro DOM
6. All **13** asset JS modules unit-tested; app modules are jQuery-free; Add another is app JS ([`docs/moj-frontend.md`](docs/moj-frontend.md))
7. UI Preview catalogue for offline GOV.UK review without Identity and Access Management (IDAM)
8. Documented missing-data playbook so empty preview pages get seeds/fallbacks, not fake template copy
9. Accessibility policy: GOV.UK over axe; real Pa11y command (not a stub in `cichecks`)
10. Documented Government Digital Service (GDS) / Service Standard frontend checklist for assessment prep

---

## Related reading

| File | Role |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Standing conventions (GOV.UK Frontend section) |
| [`docs/frontend.md`](docs/frontend.md) | Human frontend guide |
| [`docs/service-assessment.md`](docs/service-assessment.md) | Service Standard / Design System |
| [`KEYCHANGES.md`](KEYCHANGES.md) | Fork vs upstream story |
| [`ai-docs/playbooks/ui-preview-missing-data.md`](ai-docs/playbooks/ui-preview-missing-data.md) | Empty / broken preview pages |
| [`ai-docs/playbooks/govuk-frontend-upgrade.md`](ai-docs/playbooks/govuk-frontend-upgrade.md) | Pin-bump checklist |
| [`docs/moj-frontend.md`](docs/moj-frontend.md) | MoJ Frontend removed; what was done, why, standing rules |
| [`ai-docs/playbooks/moj-frontend.md`](ai-docs/playbooks/moj-frontend.md) | Agent playbook (do not re-add `@ministryofjustice/frontend`) |
| [`ai-docs/directory-mirror/src-main-views.md`](ai-docs/directory-mirror/src-main-views.md) | Views / macros traps |
| [`ai-docs/directory-mirror/src-main-assets.md`](ai-docs/directory-mirror/src-main-assets.md) | App JS / SCSS |
