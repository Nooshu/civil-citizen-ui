# Playbook: GOV.UK Frontend upgrade

Canonical: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend (macros + upgrade checklist). Government Digital Service (GDS) / assessment expectations for frontend code: [`docs/frontend.md`](../../docs/frontend.md), [`docs/service-assessment.md`](../../docs/service-assessment.md).

1. Check the **latest** [GOV.UK Frontend release on GitHub](https://github.com/alphagov/govuk-frontend/releases/latest). Pin that exact version in `package.json` (7-day cooldown unless asked / security).
2. Do **not** patch `node_modules/govuk-frontend`.
3. Fix app fallout via **macros**, app JS (`src/main/assets/js/`), app SCSS (`src/main/assets/scss/`).
4. `yarn build`
5. `yarn test:govuk-fixtures` — **must pass** (macros vs package `fixtures.json`)
6. `yarn test` (and integration if Nunjucks env/middleware changed)
7. `yarn tests:a11y` if practical
8. Confirm docs still link the [latest release](https://github.com/alphagov/govuk-frontend/releases/latest) (`AGENTS.md`, `docs/frontend.md`, `FRONTEND-RECOMMENDATIONS.md`, `docs/project-overview.md`); do **not** hard-code the version number in those pages — the exact pin lives in `package.json` only
9. If axe conflicts with official markup: disable the scanner rule, do not fork GOV.UK
10. Note any Design System divergence introduced by the bump (assessors ask)

MoJ Frontend (`@ministryofjustice/frontend`) is a separate major; do not jump 1.x → 10.x in the same drive-by.
