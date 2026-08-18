# Playbook: GOV.UK Frontend upgrade

Canonical: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend (macros + upgrade checklist).

1. Pin `govuk-frontend` exact version (7-day cooldown unless asked).
2. Do **not** patch `node_modules/govuk-frontend`.
3. Fix app fallout via **macros**, app JS (`src/main/assets/js/`), app SCSS (`src/main/assets/scss/`).
4. `yarn build`
5. `yarn test:govuk-fixtures` — **must pass** (macros vs package `fixtures.json`)
6. `yarn test` (and integration if Nunjucks env/middleware changed)
7. `yarn tests:a11y` if practical
8. Sync version in `package.json` references in `AGENTS.md`, `docs/frontend.md`, `docs/project-overview.md`
9. If axe conflicts with official markup: disable the scanner rule, do not fork GOV.UK

MoJ Frontend (`@ministryofjustice/frontend`) is a separate major; do not jump 1.x → 10.x in the same drive-by.
