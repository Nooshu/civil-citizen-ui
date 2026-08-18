# `src/main/assets/` — app JS and SCSS only

Never edit `node_modules/govuk-frontend`. Rules: `govuk-frontend-js-overrides.mdc`, `govuk-frontend-theming-overrides.mdc`.

## `js/` (webpack via `src/main/index.js`)

| File | Purpose |
| --- | --- |
| `postcode-lookup.js` | OS Places via CUI `/postcode-lookup`; binds to macro-rendered address markup |
| `append-row.js` / `reindex-add-another-actions.js` / `conditionally-hide-add-button.js` | Repeatable rows (timeline, expenses, …) |
| `calculate-amount.js` / `calculate-total-amount.js` / `calculate-length-repayment.js` | Progressive enhancement calculators |
| `remove-error-content.js` | Clears errors when user edits |
| `select-toggle.js` | Show/hide |
| `language-toggle.js` | EN/CY |
| `cookies-controller.js` | Cookie banner behaviour |
| `disable-submit.js` | Prevent double POST |
| `mojAll.js` | MoJ frontend init helper — **ESLint-ignored**; do not dump new logic here |

After adding a file, **import it from `src/main/index.js`** or it will not ship in `main`.

Cookie **config** is a separate webpack entry: `src/main/modules/cookie/cookieConfig.ts`.

`initAll()` from `govuk-frontend` runs at the end of `index.js`. Do not replace it with a custom GOV.UK initialiser.

## `scss/`

| File | Purpose |
| --- | --- |
| `main.scss` | Imports GOV.UK Frontend; app extras |
| `citizen-ui-colours.scss` | Colour tokens / overrides |
| `task-list.scss` | Task list tweaks |

Sass `loadPaths` live in `webpack/scss.js` (needed after sass-loader 17). Prefer official GOV.UK Sass settings over copying component CSS.

## Tests

`src/test/unit/assets/js/`. JS under assets may be ESM; Jest babel-jest already transforms `src/main/assets/js/*.js`.

## After changes

`yarn build` (or rely on webpack-dev-middleware in `yarn start:dev`). Watch bundle size — `.cursor/rules/performance-and-accessibility.mdc`.
