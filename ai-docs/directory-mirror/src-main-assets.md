# `src/main/assets/` — app JS and SCSS only

Never edit `node_modules/govuk-frontend`. Track the **latest** [GOV.UK Frontend release](https://github.com/alphagov/govuk-frontend/releases/latest) (exact pin in `package.json`). Conventions: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend (app JS and app SCSS only). Government Digital Service (GDS) frontend assessment checklist: [`docs/frontend.md`](../../docs/frontend.md).

## `js/` (webpack via `src/main/index.js`)

| File | Purpose |
| --- | --- |
| `postcode-lookup.js` | OS Places via CUI `/postcode-lookup`; native `fetch` + DOM; binds to macro-rendered address markup |
| `append-row.js` | Repeatable rows (timeline, expenses, employers, directions questionnaire). ESM `initAppendRow`; binds `.row-container` / `.append-row` on macro-rendered markup. Started from `initAddAnother` — **not** a separate `index.js` import. Do not nest extra `govuk-grid-column-*` inside the clone target |
| `add-another.js` | Client clone for evidence / court orders / case-progression uploads. Binds `[data-module="cui-add-another"]` only when `.cui-add-another__items` exists. Also starts `initAppendRow`. Not the npm package. Handover: [`docs/moj-frontend.md`](../../docs/moj-frontend.md). Paired test: `src/test/unit/assets/js/add-another.test.ts` (clone, remove, mediation no-op). Raise those branches with tests; do not lower the global coverage floor. |
| `reindex-add-another-actions.js` | Reindex `action[add\|remove][…]` names after a client clone (case-progression uploads) |
| `conditionally-hide-add-button.js` | Hide court-order Add another after the max row count |
| `calculate-amount.js` / `calculate-total-amount.js` / `calculate-length-repayment.js` | Progressive enhancement calculators. Length of repayment runs as soon as `document.readyState` is `complete` (not only on `window` `load`), so a pre-filled instalments form shows the schedule without waiting. |
| `remove-error-content.js` | Clears errors when user edits |
| `select-toggle.js` | Show/hide panels from a select; native DOM |
| `language-toggle.js` | EN/CY |
| `cookies-controller.js` | Cookie banner behaviour |
| `disable-submit.js` | Prevent double POST |

After adding a file, **import it from `src/main/index.js`** (or from a module that entry already imports) or it will not ship in `main`. 
Cookie **config** is a separate webpack entry: `src/main/modules/cookie/cookieConfig.ts`.

`index.js` calls `initAll()` from `govuk-frontend`, then `initAddAnother()` (which also starts `initAppendRow`). Do not replace `initAll()` with a custom GOV.UK initialiser.

## `scss/`

| File | Purpose |
| --- | --- |
| `main.scss` | Imports GOV.UK Frontend; app extras |
| `citizen-ui-colours.scss` | Colour tokens / overrides |
| `task-list.scss` | GA summary tag + overdue colour; task lists themselves come from `govukTaskList` |

Sass `loadPaths` live in `webpack/scss.js` (needed after sass-loader 17). Prefer official GOV.UK Sass settings over copying component CSS.

## Tests

`src/test/unit/assets/js/`. JS under assets may be ESM; Jest babel-jest already transforms `src/main/assets/js/*.js`. `add-another.test.ts` must cover clone, remove, and the mediation items-wrapper no-op.

## After changes

`yarn build` (or rely on webpack-dev-middleware in `yarn start:dev`). Watch bundle size — `AGENTS.md` Performance and accessibility.
