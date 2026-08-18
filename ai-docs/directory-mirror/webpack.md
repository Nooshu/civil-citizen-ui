# `webpack/` and `webpack.config.js`

Output: **`src/main/public/`** (gitignored). Do not commit or hand-edit that tree.

## Entries (`webpack.config.js`)

| Name | Source |
| --- | --- |
| `main` | `src/main/index.js` (SCSS + app JS + `govuk-frontend` `initAll()`) |
| `cookies` | `src/main/modules/cookie/cookieConfig.ts` |

Dev: `main-dev.js`. Prod: `main.[contenthash].js`. `devtool: source-map`.

## `webpack/` helpers

| File | Role |
| --- | --- |
| `app.js` | Shared app webpack bits |
| `govukFrontend.js` | Copy GOV.UK assets plugin |
| `ministryOfJusticeFrontend.js` | MoJ assets |
| `scss.js` | MiniCssExtract + sass-loader **loadPaths** (required after sass-loader 17) |
| `htmlWebpack.js` | HTML helpers for hashed tags consumed by `views/webpack/*.njk` |

`ts-loader` uses `onlyCompileBundledFiles: true` and excludes tests/playwright. Server TS is **not** compiled by webpack.

Nunjucks includes: `src/main/views/webpack/js.njk`, `css.njk`, templates.

## Commands

- `yarn build` / `yarn build:prod`
- Development: `src/main/development.ts` webpack-dev-middleware (no need to rebuild on every Nunjucks change; JS/SCSS still go through webpack)

Dockerfile runtime stage copies `src/main` from the build image and **deletes** `webpack/` from the runtime image — do not assume webpack sources exist in the prod container.

## After GOV.UK upgrades

Rebuild + `yarn test:govuk-fixtures` (`AGENTS.md` GOV.UK Frontend upgrade checklist).
