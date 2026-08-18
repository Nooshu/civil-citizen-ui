# AGENTS.md

Guidance for AI coding agents working in this repository.

Canonical Cursor rules also live in `.cursor/rules/` (always-applied `.mdc` files). Keep this document aligned with those rules when they change — prefer linking to `.mdc` files over conflicting duplicates.

## AI directory mirror (read before changing code)

Machine-oriented, directory-by-directory context for agents: **[`ai-docs/README.md`](ai-docs/README.md)**.

That folder is **AI-targeted** (not a human product manual). Use it to inspect invariants, paired tests, scripts, and playbooks before editing. Human documentation remains [`docs/README.md`](docs/README.md). If `ai-docs/` conflicts with `.cursor/rules/*.mdc` or this file, **the rule file wins**, then this file — then fix `ai-docs/` in the same change.

### Keep `ai-docs/` in sync (mandatory)

The AI mirror **will drift** if folders, scripts, or invariants change without an `ai-docs/` update. Agents **must** treat keeping it current as part of the change, not a follow-up.

Whenever you change the project, in the **same change**:

1. Check which `ai-docs/` pages describe what you touched (start from [`ai-docs/directory-mirror/INDEX.md`](ai-docs/directory-mirror/INDEX.md), plus playbooks and [`ai-docs/scripts-and-commands.md`](ai-docs/scripts-and-commands.md) if scripts or commands moved).
2. Update those pages so they still match the tree (paths, invariants, paired tests, scripts, CODEOWNERS, `NODE_ENV` behaviour, and so on).
3. If you add, rename, or remove a **top-level or major directory**, add/rename/remove the matching mirror page and an INDEX row.
4. If you add or change a Yarn script or `bin/` helper, update `scripts-and-commands.md` (and the relevant mirror page).
5. If nothing in `ai-docs/` is affected, say so briefly in the summary — do not skip the check.

Do not finish a task with a stale `ai-docs/` tree. This is in addition to updating human `docs/` and this file when those topics change (`.cursor/rules/docs-and-comments.mdc`).

Suggested first reads inside `ai-docs/`:

- [`ai-docs/pre-change-protocol.md`](ai-docs/pre-change-protocol.md)
- [`ai-docs/do-not.md`](ai-docs/do-not.md)
- [`ai-docs/directory-mirror/INDEX.md`](ai-docs/directory-mirror/INDEX.md)
- [`ai-docs/scripts-and-commands.md`](ai-docs/scripts-and-commands.md)
- [`ai-docs/skills-and-rules.md`](ai-docs/skills-and-rules.md)

## Project overview

- HMCTS **Civil Citizen UI (CUI)** — citizen-facing civil money claims web app
- **Express 5** + **TypeScript** + **Nunjucks** + **GOV.UK Frontend** (not NestJS / not a SPA)
- Server-side HTTP clients to civil-service, GA service, IDAM, DM store, etc.
- Redis draft store (ioredis) / session (`connect-redis` + official `redis` client); LaunchDarkly feature flags; i18next (EN/CY)
- Default branch: `master`
- Upstream remote: `hmcts` (`hmcts/civil-citizen-ui`) — add if missing: `git remote add hmcts git@github.com:hmcts/civil-citizen-ui.git`
- Push/pull default: `origin` (fork), unless doing an upstream sync
- Human-oriented project documentation: [`docs/README.md`](docs/README.md)
- AI-oriented directory mirror (read before code changes): [`ai-docs/README.md`](ai-docs/README.md)

## Runtime

- Node.js must match `engines` in `package.json` and `.nvmrc`
- Current target: Node `>=24.18.0` (see `.nvmrc`)
- Package manager: **Yarn 4** (`yarn.lock`, `.yarnrc.yml`) — not npm
- TypeScript: **`6.0.3`** (exact). `tsconfig.json` sets `"strict": false` and `"types": ["*"]` to preserve pre-6 defaults, plus `"ignoreDeprecations": "6.0"` while `moduleResolution`/`baseUrl` remain transitional (required before TypeScript 7). Jest configs set `"rootDir": "."` for TS 6 / ts-jest (TS5011). `playwright/tsconfig.json` covers the Playwright specs, which the root config excludes — it is editor/type-check only (`noEmit`), and scopes `"types"` to `["node"]` so jest/mocha/chai globals do not clash with `@playwright/test` imports.
- Prefer `nvm use` (or equivalent) before install/test commands
- Local default URL: **https://localhost:3001** (`yarn start:dev`) — HTTPS with self-signed cert in development
- Redis draft store: `yarn start:redis` (Docker Compose `compose/draft-store.yml`, port `6379`)
- Health: `https://localhost:3001/health`
- **UI Preview (no IDAM):** `yarn preview` (or `yarn start:ui-preview`) → rebuilds, frees ports, starts Docker stack, prints **http://localhost:3001/ui-preview** (`compose/ui-preview.yml`, `bin/ui-preview.sh`)
  - Distinct from `yarn start:dev` (real Redis + OIDC)
  - Fixture user id: `someID`; sample claim: `1645882162449409`
  - Preview-only WireMock stubs: `compose/ui-preview-mappings/` — keep them out of `charts/civil-citizen-ui/wiremock/mappings`, which is the validated reduced-stack contract set (`yarn wiremock:validate` forbids broad matchers)
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
  - **SIGSEGV / Jest worker crash:** re-run the failed suite alone; if it passes, the update is complete — do **not** re-run the full suite. Test scripts pass `--no-sparkplug` to avoid the known V8 GC crash (see Testing and coverage)
  - Long coverage runs: background and poll with ≤1 minute waits — see `.cursor/rules/shell-wait-limits.mdc`

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

Pinned dependency: **`govuk-frontend@6.4.0`** (see `package.json`; bump docs when upgrading).

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

- Keep **all** project documentation accurate when behaviour, versions, remotes, tooling, or standards change (README, `AGENTS.md`, changelogs, human `docs/`)
- **Always update `ai-docs/` in the same change** when the project tree, scripts, or invariants change — see [Keep `ai-docs/` in sync](#keep-ai-docs-in-sync-mandatory)
- Document **why** for non-obvious decisions; after dependency or GOV.UK upgrades, sync version notes
- Use **TSDoc-compatible** `/** */` comments: summary first, `@remarks` for longer constraints, `{@link}` / `@see` / `@deprecated` when useful
- **Do not** put TypeScript types in JSDoc braces (`@param {string} x` is wrong in `.ts`); use `@param x - Description`
- **Do not** use `@module`, `@requires`, `@class`, `@function`, or `@async` tags
- Write **comprehensive comments** on public modules/classes and non-trivial functions: purpose, behaviour, side effects, security/performance/GOV.UK constraints
- Annotate Nunjucks where macros are composed or client scripts depend on macro-rendered markup
- Explain **why** and constraints — not a line-by-line restatement of obvious code
- When changing code, update nearby comments and related docs in the same change
- Before finishing: docs confirmed (including `ai-docs/`), public APIs commented, and this file / `.cursor/rules` updated if a standing convention changed

## Testing and coverage

- Jest unit tests (`src/test/unit`), Jest integration (`src/integration-test`), CodeceptJS functional, Playwright security, Pact contracts, Pa11y a11y
- After **server TypeScript** changes, run type-check/build and relevant tests and **fix compile errors** in the same change — prefer real types over `any` / `@ts-ignore` — see `.cursor/rules/verify-ts-build-after-server-changes.mdc`
- Useful commands:
  - `yarn test` — Jest unit tests
  - `yarn test:govuk-fixtures` — GOV.UK Frontend macro HTML vs release fixtures.json
  - `yarn test:coverage` — Jest with coverage
  - `yarn test:integration` / `yarn test:routes` — route integration tests
  - `yarn build` — webpack assets
  - `yarn lint` — ESLint 10 flat config (`eslint.config.mjs`) + stylelint; Windows: `yarn lint:win`
  - `yarn test:functional` — CodeceptJS functional (needs env)
  - `yarn tests:a11y` — Pa11y accessibility
  - Playwright security specs under `playwright/tests/`
- All Jest entry points run through `node --no-sparkplug ./node_modules/jest/bin/jest.js`. Sparkplug plus the `vm` module Jest uses to execute test files triggers a V8 13.6 garbage-collector segfault in `ClearStaleLeftTrimmedPointerVisitor`, which kills a random worker mid-run ([nodejs/node#62393](https://github.com/nodejs/node/issues/62393), still present in Node 24.18.0). Jest forks workers with the parent's `execArgv`, so setting the flag on the entry point covers them. Keep the flag when editing test scripts, and do not move it into `NODE_OPTIONS` — Node rejects V8 flags there.

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
| `ai-docs/README.md` | AI-only directory mirror, playbooks, scripts, and pre-change protocol |
| `docs/README.md` | Human project documentation (architecture, journeys, testing, CI) |
| `.cursor/rules/project-standards.mdc` | Node/Yarn, hmcts/origin sync, tests after deps, summary risks |
| `.cursor/rules/dependency-pinning.mdc` | Exact pins, 7-day cooldown, yarn.lock integrity, full `yarn test:coverage` after bumps |
| `.cursor/rules/shell-wait-limits.mdc` | Cap Shell/AwaitShell blocking waits at 1 minute; background long jobs and poll |
| `.cursor/rules/prefer-express-typescript-stack.mdc` | Prefer Express/TS/CUI patterns over ad-hoc stacks |
| `.cursor/rules/govuk-frontend-ui.mdc` | GOV.UK Frontend macros as UI source of truth |
| `.cursor/rules/govuk-frontend-upgrade-tests.mdc` | After GOV.UK bumps: rebuild + regression tests |
| `.cursor/rules/prefer-govuk-over-axe.mdc` | Prefer GOV.UK Frontend over axe when they conflict |
| `.cursor/rules/govuk-frontend-js-overrides.mdc` | GOV.UK interactivity via app JS overrides only |
| `.cursor/rules/govuk-frontend-theming-overrides.mdc` | GOV.UK theming via app SCSS/CSS overrides only |
| `.cursor/rules/reuse-nunjucks-partials.mdc` | Reuse partials/macros; no duplicate shared markup |
| `.cursor/rules/performance-and-accessibility.mdc` | Frontend/API performance + accessible UI priorities |
| `.cursor/rules/verify-ts-build-after-server-changes.mdc` | After server TS changes, verify build/tests; fix compile errors |
| `.cursor/rules/docs-and-comments.mdc` | Keep docs current; TSDoc-compatible comments (no typed `{Type}` braces); keep `ai-docs/` in sync |
| `.cursor/rules/no-cursor-agent-commits.mdc` | Never attribute Cursor agent on commits/pushes |
| `.cursor/rules/no-invented-jira-ids.mdc` | Never invent JIRA/ticket IDs in commits, PRs, or docs |

Older tooling may look for `AGENT.md`; that path is a symlink to this file.
