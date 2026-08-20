# Frontend

## Source of truth: GOV.UK Frontend

Longer recommendations from this fork (macros, progressive enhancement, fixture suite, gradual jQuery removal): [`FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md).

Pinned package: **`govuk-frontend@6.4.0`**. Official Nunjucks macros are mandatory for Design System components. Do not hand-write `govuk-button`, `govuk-error-summary`, `govuk-header`, `govuk-table`, `govuk-inset-text`, `govuk-tabs`, `govuk-summary-list`, `govuk-tag`, `govuk-fieldset`, `govuk-error-message`, `govuk-details`, `govuk-task-list`, footer, skip link, or breadcrumbs when a macro exists. Do not wrap `govukRadios` / `yesNoRadioButton` in a second `<fieldset>`.

```njk
{% from "govuk/components/button/macro.njk" import govukButton %}

{{ govukButton({ text: t('COMMON.BUTTONS.CONTINUE') }) }}
```

Typography and layout utilities (`govuk-heading-l`, `govuk-grid-row`, `govuk-!-margin-top-6`, …) are allowed for page composition.

Canonical rules: [`AGENTS.md`](../AGENTS.md) — GOV.UK Frontend. Service assessment mapping (look like GOV.UK, fixture HTML, Web Content Accessibility Guidelines (WCAG) 2.2 AA): [service-assessment.md](service-assessment.md). Acronyms: [glossary](glossary.md).

- Official Nunjucks macros for Design System components (including header, table, inset text, buttons, tabs, summary list, tags, details, date-input errors, and task lists)
- If axe disagrees with GOV.UK output, GOV.UK wins; disable the scanner rule rather than forking markup
- Extract shared journey chrome instead of copying HTML

Ministry of Justice (MoJ) Frontend (`@ministryofjustice/frontend`, currently a 1.x pin) is used where this service already depends on it. Do not jump major versions without a dedicated user interface (UI) migration.

## Layouts and views

| File | Role |
| --- | --- |
| `src/main/views/govukTemplate.njk` | GOV.UK page chrome |
| `src/main/views/layout.njk` | Application layout (header, footer, phase banner, language) |
| `src/main/views/macro/` | Shared app macros |
| `src/main/views/features/` | Journey pages |
| `src/main/views/error.njk` / `not-found.njk` / `unauthorised.njk` | Error states |
| `src/main/views/service-unavailable.njk` | LaunchDarkly shutter |

Nunjucks is configured in `src/main/modules/nunjucks/index.ts`. Search paths include app `views/`, `govuk-frontend/dist`, and `@ministryofjustice/frontend`. Filters include currency, dates, and translation helpers. Dynatrace and Google Tag Manager (GTM) snippets are injected with Content Security Policy (CSP) nonces.

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
2. Imports app helpers (postcode lookup, add-another rows, amount calculators, cookie banner, language toggle, …)
3. Calls `initAll()` from `govuk-frontend`

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

The suite `src/test/unit/govukFrontend/govukFrontendFixtures.test.ts` renders official macros through this app’s Nunjucks environment and compares HTML to the package’s `fixtures.json`. **Do not merge if fixtures fail.** See `AGENTS.md` GOV.UK Frontend (upgrade checklist).

## Accessibility

- Keep skip link, labels, error summary, and focus behaviour from GOV.UK macros.
- Pa11y: `yarn tests:a11y` (alias `yarn test:a11y`). Jenkins runs `tests:a11y:parallel`. Not part of `yarn cichecks`.
- Functional journeys should stay keyboard-usable; do not “fix” axe by breaking GOV.UK.

## Performance (UI)

- Avoid extra bundles and blocking scripts.
- Prefer server-rendered HTML (Largest Contentful Paint, LCP).
- Watch layout shift from late CSS or injected banners.
- Web chat and Dynatrace are third-party scripts; they are nonce’d in CSP and should stay optional via config.
