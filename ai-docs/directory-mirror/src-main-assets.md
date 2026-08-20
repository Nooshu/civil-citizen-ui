# `src/main/assets/` — app JS and SCSS only

Never edit `node_modules/govuk-frontend`. Track the **latest** [GOV.UK Frontend release](https://github.com/alphagov/govuk-frontend/releases/latest) (exact pin in `package.json`). Conventions: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend (app JS and app SCSS only). Government Digital Service (GDS) frontend assessment checklist: [`docs/frontend.md`](../../docs/frontend.md).

## `js/` (webpack via `src/main/index.js`)

| File | Purpose |
| --- | --- |
| `postcode-lookup.js` | OS Places via CUI `/postcode-lookup`; native `fetch` + DOM; binds to macro-rendered address markup |
| `append-row.js` / `reindex-add-another-actions.js` / `conditionally-hide-add-button.js` | Repeatable rows (timeline, expenses, employers). Bind to `.row-container` / `.append-row` on macro-rendered markup — do not nest extra `govuk-grid-column-*` inside the clone target |
| `calculate-amount.js` / `calculate-total-amount.js` / `calculate-length-repayment.js` | Progressive enhancement calculators. Length of repayment runs as soon as `document.readyState` is `complete` (not only on `window` `load`), so a pre-filled instalments form shows the schedule without waiting. |
| `remove-error-content.js` | Clears errors when user edits |
| `select-toggle.js` | Show/hide panels from a select; native DOM |
| `language-toggle.js` | EN/CY |
| `cookies-controller.js` | Cookie banner behaviour |
| `disable-submit.js` | Prevent double POST |
| `mojAll.js` | MoJ frontend init helper — **ESLint-ignored**; do not dump new logic here. Excluded from Jest `collectCoverageFrom`. Needs global `$` from `jquery` (imported in `src/main/index.js` before this file) |

After adding a file, **import it from `src/main/index.js`** or it will not ship in `main`. App modules must not import jQuery; only `index.js` may load it for MoJ.

Cookie **config** is a separate webpack entry: `src/main/modules/cookie/cookieConfig.ts`.

`initAll()` from `govuk-frontend` runs at the end of `index.js`. Do not replace it with a custom GOV.UK initialiser.

## `scss/`

| File | Purpose |
| --- | --- |
| `main.scss` | Imports GOV.UK Frontend; app extras |
| `citizen-ui-colours.scss` | Colour tokens / overrides |
| `task-list.scss` | GA summary tag + overdue colour; task lists themselves come from `govukTaskList` |

Sass `loadPaths` live in `webpack/scss.js` (needed after sass-loader 17). Prefer official GOV.UK Sass settings over copying component CSS.

## Tests

`src/test/unit/assets/js/`. JS under assets may be ESM; Jest babel-jest already transforms `src/main/assets/js/*.js`.

## After changes

`yarn build` (or rely on webpack-dev-middleware in `yarn start:dev`). Watch bundle size — `AGENTS.md` Performance and accessibility.
