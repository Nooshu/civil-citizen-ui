# Frontend

## Source of truth: GOV.UK Frontend

Longer recommendations from this fork (macros, progressive enhancement, fixture suite, jQuery-free app JS, Government Digital Service (GDS) compliance): [`FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md).

Use the **latest** [GOV.UK Frontend release on GitHub](https://github.com/alphagov/govuk-frontend/releases/latest). Pin that **exact** version in `package.json` (see `dependencies.govuk-frontend`; never use ranges). Upgrade with the checklist in [`AGENTS.md`](../AGENTS.md) — GOV.UK Frontend.

Official Nunjucks macros are mandatory for Design System components. Do not hand-write `govuk-button`, `govuk-error-summary`, `govuk-header`, `govuk-table`, `govuk-inset-text`, `govuk-tabs`, `govuk-summary-list`, `govuk-tag`, `govuk-fieldset`, `govuk-error-message`, `govuk-details`, `govuk-task-list`, footer, skip link, or breadcrumbs when a macro exists. Do not wrap `govukRadios` / `yesNoRadioButton` in a second `<fieldset>`.

```njk
{% from "govuk/components/button/macro.njk" import govukButton %}

{{ govukButton({ text: t('COMMON.BUTTONS.CONTINUE') }) }}
```

Typography and layout utilities (`govuk-heading-l`, `govuk-grid-row`, `govuk-!-margin-top-6`, …) are allowed for page composition.

Canonical rules: [`AGENTS.md`](../AGENTS.md) — GOV.UK Frontend. Service assessment mapping (look like GOV.UK, fixture HTML, Web Content Accessibility Guidelines (WCAG) 2.2 AA): [service-assessment.md](service-assessment.md). Acronyms: [glossary](glossary.md).

- Official Nunjucks macros for Design System components (including header, table, inset text, buttons, tabs, summary list, tags, details, date-input errors, and task lists)
- If axe disagrees with GOV.UK output, GOV.UK wins; disable the scanner rule rather than forking markup
- Extract shared journey chrome instead of copying HTML

Ministry of Justice (MoJ) Frontend is **not** a dependency. Repeatable rows use app JS ([`src/main/assets/js/add-another.js`](../src/main/assets/js/add-another.js)) — `initAddAnother` for `cui-add-another*` rows and `initAppendRow` for `.append-row` / `.row-container`. Do not re-add `@ministryofjustice/frontend`. Handover: [moj-frontend.md](moj-frontend.md). Agent playbook: [`ai-docs/playbooks/moj-frontend.md`](../ai-docs/playbooks/moj-frontend.md).

## Government Digital Service (GDS) compliance — what assessors expect from frontend code

A service assessment that examines the frontend is not a visual preference review. It checks whether the team meets Government Digital Service (GDS) expectations under the [Service Standard](https://www.gov.uk/service-manual/service-standard) — especially **4** (simple / look like GOV.UK), **5** (everyone can use it), **11** (right tools), and **13** (common standards and patterns). See [service-assessment.md](service-assessment.md) for the full map.

**Development team checklist** (do these; keep evidence in PRs / CI):

1. **Design System first** — Implement published [GOV.UK Design System](https://design-system.service.gov.uk/) components and patterns via official Nunjucks macros, not hand-written `govuk-*` HTML.
2. **Current Frontend package** — Depend on the [latest GOV.UK Frontend release](https://github.com/alphagov/govuk-frontend/releases/latest) (exact pin). After each bump: `yarn build`, `yarn test:govuk-fixtures`, relevant Jest, and `yarn tests:a11y` where practical.
3. **Prove HTML fidelity** — `yarn test:govuk-fixtures` must pass. Assessors can ask how you know markup matches the Design System; the fixture suite is the answer ([official fixture guidance](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files)).
4. **Progressive enhancement** — Usable server-rendered pages; client JS in `src/main/assets/js/` only enhances macro-rendered DOM; call `initAll()` from `govuk-frontend`, then `initAddAnother()` (which also starts `initAppendRow`).
5. **Accessibility** — Meet **WCAG 2.2 AA**. Preserve skip link, labels, error summaries, focus order, and keyboard behaviour from macros. Run Pa11y (`yarn tests:a11y`). Do not rewrite GOV.UK to quiet axe.
6. **Citizen stack** — Keep Express + Nunjucks server-side rendering. Do not introduce a citizen Single Page Application (SPA); that conflicts with [HMCTS citizen frontend practice](https://hmcts.github.io/standards/practices/frontend.html) and Service Standard 11/13.
7. **Content and i18n** — User-visible copy follows the [GOV.UK style guide](https://www.gov.uk/guidance/style-guide); English and Welsh keys move together.
8. **Explain divergences** — If a screen cannot use a published pattern, document why (and research if you adapted). Assessors routinely ask where the service diverges from the Design System.
9. **Secure delivery of UI assets** — Content Security Policy (CSP) nonces for scripts; no `unsafe-inline`; CSRF on state-changing POSTs.

This repository alone cannot prove the whole assessment (research, assisted digital, KPIs). It **can** show that frontend code is GDS-aligned. Flag any PR that weakens the table above as assessment risk.

## Layouts and views

| File | Role |
| --- | --- |
| `src/main/views/govukTemplate.njk` | GOV.UK page chrome |
| `src/main/views/layout.njk` | Application layout (header, footer, phase banner, language) |
| `src/main/views/macro/` | Shared app macros |
| `src/main/views/features/` | Journey pages |
| `src/main/views/error.njk` / `not-found.njk` / `unauthorised.njk` | Error states |
| `src/main/views/service-unavailable.njk` | LaunchDarkly shutter |

Nunjucks is configured in `src/main/modules/nunjucks/index.ts`. Search paths include app `views/` and `govuk-frontend/dist`. Filters include currency, dates, and translation helpers. Dynatrace and Google Tag Manager (GTM) snippets are injected with Content Security Policy (CSP) nonces.

## Internationalisation (i18n)

i18next loads `src/main/modules/i18n/locales/{{lng}}.json` (`en` and `cy`). Language is detected from query string `lang` and a cookie (`modules/i18n`, `setLanguage` middleware).

When adding copy:

1. Add keys to English locale.
2. Add Welsh (`cy`) in the same change when the string is user-visible.
3. Use `t('PAGES.SOME_PAGE.TITLE')` in Nunjucks and services — do not hard-code sentences in controllers.

LaunchDarkly `enableWelshForMainCase` gates Welsh for the main claim where required.

## Client JavaScript

Webpack entry `src/main/index.js`:

1. Imports `assets/scss/main.scss`
2. Imports app helpers (postcode lookup, amount calculators, cookie banner, language toggle, …) and `initAddAnother` from `add-another.js` (which also starts `initAppendRow` — `append-row.js` is **not** a separate entry import)
3. Calls `initAll()` from `govuk-frontend`, then `initAddAnother()`

**Do not** edit `node_modules/govuk-frontend`. App behaviour belongs in `src/main/assets/js/`. Prefer showing/hiding macro-rendered markup over building GOV.UK HTML in JS.

Cookie configuration is a second webpack entry (`modules/cookie/cookieConfig.ts`) producing a `cookies` bundle.

## CSS / Sass

`src/main/assets/scss/main.scss` imports GOV.UK Frontend. Theme overrides stay in app SCSS (`AGENTS.md` GOV.UK Frontend). `sass-loader` is configured with `loadPaths` so `@import 'node_modules/…'` still resolves after sass-loader 17 (see `webpack/scss.js`).

## Webpack

`webpack.config.js`:

- Output: `src/main/public/` (`main-dev.js` / hashed `main.[contenthash].js`)
- Loaders: `ts-loader` (bundled files only), Sass, MiniCssExtract
- Plugins: GOV.UK assets copy, HTML helpers, MiniCssExtract

`yarn build` for a one-off compile. In `NODE_ENV=development`, `webpack-dev-middleware` serves from memory.

## Fixture accuracy

After any GOV.UK Frontend upgrade:

```bash
yarn build
yarn test:govuk-fixtures
```

The suite `src/test/unit/govukFrontend/govukFrontendFixtures.test.ts` renders official macros through this app’s Nunjucks environment and compares HTML to the package’s `fixtures.json` — **692** assertions across **37** components. **Do not merge if fixtures fail.** The exact `govuk-frontend` pin lives in `package.json` only; as of 26 August 2026 it matches the [latest GitHub release](https://github.com/alphagov/govuk-frontend/releases/latest). See `AGENTS.md` GOV.UK Frontend (upgrade checklist).

## Accessibility

- Keep skip link, labels, error summary, and focus behaviour from GOV.UK macros.
- Pa11y: `yarn tests:a11y` (alias `yarn test:a11y`). Jenkins runs `tests:a11y:parallel`. Not part of `yarn cichecks`. Scans mocked citizen GETs from `urls.ts` (**360** HTML fixtures under `src/test/utils/mocks/a11y/`); ignore scanner codes that conflict with GOV.UK macros rather than dropping those pages. A green mock run is not a WCAG 2.2 AA audit.
- Functional journeys should stay keyboard-usable; do not “fix” axe by breaking GOV.UK.

## Performance (UI)

- Avoid extra bundles and blocking scripts.
- Prefer server-rendered HTML (Largest Contentful Paint, LCP).
- Watch layout shift from late CSS or injected banners.
- Web chat and Dynatrace are third-party scripts; they are nonce’d in CSP and should stay optional via config.
