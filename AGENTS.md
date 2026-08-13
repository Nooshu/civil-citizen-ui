# AGENTS.md

Guidance for AI coding agents working in this repository.

Canonical Cursor rules also live in `.cursor/rules/` (always-applied `.mdc` files). Keep this document aligned with those rules when they change — prefer linking to `.mdc` files over conflicting duplicates.

## Project overview

- HMCTS **Civil Citizen UI (CUI)** — citizen-facing civil money claims web app
- **Express 5** + **TypeScript** + **Nunjucks** + **GOV.UK Frontend** (not NestJS / not a SPA)
- Server-side HTTP clients to civil-service, GA service, IDAM, DM store, etc.
- Redis draft store (ioredis) / session (`connect-redis` + official `redis` client); LaunchDarkly feature flags; i18next (EN/CY)
- Default branch: `master`
- Upstream remote: `hmcts` (`hmcts/civil-citizen-ui`) — add if missing: `git remote add hmcts git@github.com:hmcts/civil-citizen-ui.git`
- Push/pull default: `origin` (fork), unless doing an upstream sync

## Runtime

- Node.js must match `engines` in `package.json` and `.nvmrc`
- Current target: Node `>=24.18.0` (see `.nvmrc`)
- Package manager: **Yarn 4** (`yarn.lock`, `.yarnrc.yml`) — not npm
- Prefer `nvm use` (or equivalent) before install/test commands
- Local default URL: **https://localhost:3001** (`yarn start:dev`) — HTTPS with self-signed cert in development
- Redis draft store: `yarn start:redis` (Docker Compose `compose/draft-store.yml`, port `6379`)
- Health: `https://localhost:3001/health`
- **UI Preview (no IDAM):** `yarn preview` (or `yarn start:ui-preview`) → rebuilds, frees ports, starts Docker stack, prints **http://localhost:3001/ui-preview** (`compose/ui-preview.yml`, `bin/ui-preview.sh`)
 - Distinct from `yarn start:dev` (real Redis + OIDC)
 - Fixture user id: `someID`; sample claim: `1645882162449409`
 - Stop: `yarn start:ui-preview:down`

## Before changing code

1. Sync with upstream `hmcts` first (see `.cursor/rules/project-standards.mdc`):
   - If the working tree is not clean, ask for confirmation (or create a branch) before syncing
   - `git fetch hmcts`
   - `git pull --rebase hmcts master`
2. Prefer focused, minimal diffs that match existing style

## Dependencies

- Prefer **patch and minor** updates unless explicitly asked for latest/major
- Prefer versions published at least **7 days** ago for routine updates (security fixes may skip the wait) — see `.cursor/rules/dependency-pinning.mdc`
- When updating deps, prefer **exact pins** (no `^`, `~`, or ranges) for packages you touch; refresh `yarn.lock`
- Avoid introducing breaking changes; verify installs with `yarn install`
- When updating **multiple** packages in one task: update all targets and refresh the lockfile, then run tests once
- After dependency update prompts: apply the bump, then run the full coverage suite (`yarn test:coverage`); if anything breaks, tell the user first, then fix — see `.cursor/rules/dependency-pinning.mdc`
  - **SIGSEGV / Jest worker crash:** re-run the failed suite alone; if it passes, the update is complete — do **not** re-run the full suite
  - Long coverage runs: background and poll with ≤2 minute waits — see `.cursor/rules/shell-wait-limits.mdc`
- **`cookie@2` resolution:** forced via Yarn resolutions + `.yarn/patches/cookie-npm-2.0.1-*.patch`. Upstream Express / `cookie-parser` / `express-session` / csurf still call removed `parse` / `serialize`; the patch restores those as aliases over `parseCookie` / `stringifySetCookie`. Remove the patch once those packages support cookie v2 natively.

## Package-only updates (auto origin sync)

If the change is **only** version bumps in `package.json` / `yarn.lock` (no other code changes), once checks pass:

1. `git fetch origin`
2. `git pull --rebase origin master`
3. `git push origin master` (or `git push --force-with-lease origin master` only when history was rebased)

## Server / application stack

- Prefer **Express**, **TypeScript**, and existing CUI patterns under `src/main/` — see `.cursor/rules/prefer-express-typescript-stack.mdc`
- Keep controllers in `src/main/routes/`, business logic in `src/main/services/`, models/forms in `src/main/common/`, HTTP clients in `src/main/app/`
- Prefer class-validator form models, existing draft-store helpers, and typed service APIs over ad-hoc untyped helpers
- Do not introduce NestJS, Prisma, or a parallel SPA framework unless explicitly requested

## GOV.UK Frontend

Pinned dependency: **`govuk-frontend@6.4.0`** (exact).

- **GOV.UK Frontend is the single source of truth** for the user interface — see `.cursor/rules/govuk-frontend-ui.mdc`
- All GOV.UK Design System component HTML must come from official Nunjucks macros — do not hand-write component markup when a macro exists
- Prefer `{% from "govuk/components/.../macro.njk" import ... %}`; layout chrome (skip link, header, footer, breadcrumbs, pagination) must use macros
- Typography/layout utilities (`govuk-heading-*`, `govuk-body`, `govuk-grid-*`, `govuk-!-*-*`) are fine for composition; component structure still comes from macros
- Client-side UI should show/hide or populate **macro-rendered** markup rather than building GOV.UK component HTML in JavaScript
- Prefer GOV.UK Frontend HTML, CSS, and JS over **axe** / **axe-core** when they conflict (document/disable the scanner rule; do not rewrite GOV.UK) — see `.cursor/rules/prefer-govuk-over-axe.mdc`
- Interactivity via **app JS overrides only** (`src/main/assets/js/`); keep GOV.UK Frontend init; do not edit `node_modules/govuk-frontend` — see `.cursor/rules/govuk-frontend-js-overrides.mdc`
- Theming via **app SCSS/CSS overrides only** (`src/main/assets/scss/`); do not fork vendor CSS — see `.cursor/rules/govuk-frontend-theming-overrides.mdc`
- Reuse Nunjucks partials and GOV.UK macros under `src/main/views/`; **do not duplicate shared journey markup** — extract shared partials instead — see `.cursor/rules/reuse-nunjucks-partials.mdc`
- **HTML fixture accuracy:** every component’s official macros must match the release `fixtures.json` HTML ([GOV.UK docs](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files)). Suite: `yarn test:govuk-fixtures` (`src/test/unit/govukFrontend/`)
- After GOV.UK Frontend upgrades, rebuild webpack assets and run regression suites — see `.cursor/rules/govuk-frontend-upgrade-tests.mdc`

## Performance and accessibility

Treat **frontend performance**, **backend/API efficiency**, and **accessible UI** as top priorities on every change — see `.cursor/rules/performance-and-accessibility.mdc`

- Frontend: avoid unnecessary JS/assets; prefer progressive enhancement on macros
- Backend: avoid N+1 civil-service calls; reuse draft-store helpers; watch Redis TTL/key design
- Accessibility: preserve GOV.UK focus, labels, error summaries, and skip-link behaviour; do not break GOV.UK to silence axe
- Call out residual performance or a11y risks in summaries

## Documentation and code comments

See `.cursor/rules/docs-and-comments.mdc`.

- Keep **all** project documentation accurate when behaviour, versions, remotes, tooling, or standards change (README, `AGENTS.md`, changelogs)
- Document **why** for non-obvious decisions; after dependency or GOV.UK upgrades, sync version notes
- Use **TSDoc-compatible** `/** */` comments: summary first, `@remarks` for longer constraints, `{@link}` / `@see` / `@deprecated` when useful
- **Do not** put TypeScript types in JSDoc braces (`@param {string} x` is wrong in `.ts`); use `@param x - Description`
- **Do not** use `@module`, `@requires`, `@class`, `@function`, or `@async` tags
- Write **comprehensive comments** on public modules/classes and non-trivial functions: purpose, behaviour, side effects, security/performance/GOV.UK constraints
- Annotate Nunjucks where macros are composed or client scripts depend on macro-rendered markup
- Explain **why** and constraints — not a line-by-line restatement of obvious code
- When changing code, update nearby comments and related docs in the same change
- Before finishing: docs confirmed, public APIs commented, and this file / `.cursor/rules` updated if a standing convention changed

## Testing and coverage

- Jest unit tests (`src/test/unit`), Jest integration (`src/integration-test`), CodeceptJS functional, Playwright security, Pact contracts, Pa11y a11y
- After **server TypeScript** changes, run type-check/build and relevant tests and **fix compile errors** in the same change — prefer real types over `any` / `@ts-ignore` — see `.cursor/rules/verify-ts-build-after-server-changes.mdc`
- Useful commands:
  - `yarn test` — Jest unit tests
  - `yarn test:govuk-fixtures` — GOV.UK Frontend macro HTML vs release fixtures.json
  - `yarn test:coverage` — Jest with coverage
  - `yarn test:integration` / `yarn test:routes` — route integration tests
  - `yarn build` — webpack assets
  - `yarn lint` — ESLint + stylelint
  - `yarn test:functional` — CodeceptJS functional (needs env)
  - `yarn tests:a11y` — Pa11y accessibility
  - Playwright security specs under `playwright/tests/`

## Git and commits

- Do **not** create commits unless the user asks
- Do **not** push unless the user asks, except the package-only auto-push rule above
- Never update git config; avoid destructive git commands unless explicitly requested
- Never use interactive git flags (`-i`)
- Never attach Cursor agent / `cursoragent` identity to commits or pushes (including `Co-Authored-By`, author/committer spoofing, or hook-injected agent trailers) — see `.cursor/rules/no-cursor-agent-commits.mdc`
- **Never invent JIRA / ticket IDs** (e.g. `DTSCCI-1234`, `CIV-999`) in commit messages, PR titles, branch names, or docs. Only include a ticket key when the user explicitly provides it. If none is given, write a normal message without a ticket prefix

## Communication

- Be direct and concise
- Summaries must include **risks** and **unresolved issues**

## Related rule files

| File | Purpose |
|------|---------|
| `.cursor/rules/project-standards.mdc` | Node/Yarn, hmcts/origin sync, tests after deps, summary risks |
| `.cursor/rules/dependency-pinning.mdc` | Exact pins, 7-day cooldown, yarn.lock integrity, full `yarn test:coverage` after bumps |
| `.cursor/rules/shell-wait-limits.mdc` | Cap Shell/AwaitShell blocking waits at 2 minutes; background long jobs and poll |
| `.cursor/rules/prefer-express-typescript-stack.mdc` | Prefer Express/TS/CUI patterns over ad-hoc stacks |
| `.cursor/rules/govuk-frontend-ui.mdc` | GOV.UK Frontend macros as UI source of truth |
| `.cursor/rules/govuk-frontend-upgrade-tests.mdc` | After GOV.UK bumps: rebuild + regression tests |
| `.cursor/rules/prefer-govuk-over-axe.mdc` | Prefer GOV.UK Frontend over axe when they conflict |
| `.cursor/rules/govuk-frontend-js-overrides.mdc` | GOV.UK interactivity via app JS overrides only |
| `.cursor/rules/govuk-frontend-theming-overrides.mdc` | GOV.UK theming via app SCSS/CSS overrides only |
| `.cursor/rules/reuse-nunjucks-partials.mdc` | Reuse partials/macros; no duplicate shared markup |
| `.cursor/rules/performance-and-accessibility.mdc` | Frontend/API performance + accessible UI priorities |
| `.cursor/rules/verify-ts-build-after-server-changes.mdc` | After server TS changes, verify build/tests; fix compile errors |
| `.cursor/rules/docs-and-comments.mdc` | Keep docs current; TSDoc-compatible comments (no typed `{Type}` braces) |
| `.cursor/rules/no-cursor-agent-commits.mdc` | Never attribute Cursor agent on commits/pushes |
| `.cursor/rules/no-invented-jira-ids.mdc` | Never invent JIRA/ticket IDs in commits, PRs, or docs |

Older tooling may look for `AGENT.md`; that path is a symlink to this file.
