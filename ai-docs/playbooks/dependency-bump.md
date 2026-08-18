# Playbook: dependency bump

Canonical: `.cursor/rules/dependency-pinning.mdc` and `AGENTS.md`.

1. Confirm the version has been on npm **≥ 7 days** (security fixes may skip).
2. Prefer **patch/minor** unless the user asked for major.
3. Exact pin in `package.json` (no `^` / `~` on packages you touch).
4. `YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install` if the lockfile must change.
5. If **multiple** packages: bump all, install once, test **once**.
6. `yarn test:coverage` (background + poll ≤ 60s).
7. If SIGSEGV: re-run the failed file only; if it passes, **stop**.
8. If real failures: tell the user first, then fix; re-run coverage after real fixes.
9. GOV.UK Frontend: also `yarn build` + `yarn test:govuk-fixtures` and upgrade-tests rule.
10. Sync version notes in `AGENTS.md` / `docs/` if they mention the package.
11. Package-**only** change and checks pass: origin fetch/rebase/push rule in `AGENTS.md` (maintainers). Do not invent JIRA ids. No agent co-author.

Do not casually bump: `config` v5 (ESM), `connect-redis` v10 (ioredis), `@ministryofjustice/frontend` v10, Babel 8 + Jest 30. See `docs/dependency-update-log-2026-08-18.md`.
