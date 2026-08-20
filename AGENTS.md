# AGENTS.md

Guidance for **any** coding agent (or human) working in this repository. This file is the **canonical** standing convention set — it is not tied to a particular IDE or vendor.

Do **not** add editor-specific rule packs (for example Cursor `.mdc` files). If a convention changes, update **this file** and the matching pages under [`docs/`](docs/README.md) and [`ai-docs/`](ai-docs/README.md). Older tooling may look for `AGENT.md`; that path is a symlink to this file.

Directory-level context, scripts, and playbooks: [`ai-docs/README.md`](ai-docs/README.md). Human project guide: [`docs/README.md`](docs/README.md). If `ai-docs/` conflicts with this file, **this file wins** — then fix `ai-docs/` in the same change.

## AI directory mirror (read before changing code)

Machine-oriented, directory-by-directory context for agents: **[`ai-docs/README.md`](ai-docs/README.md)**.

That folder is **AI-targeted** (not a human product manual). Use it to inspect invariants, paired tests, scripts, and playbooks before editing. Human documentation remains [`docs/README.md`](docs/README.md). If `ai-docs/` conflicts with this file, **this file wins** — then fix `ai-docs/` in the same change.

### Keep `ai-docs/` in sync (mandatory)

The AI mirror **will drift** if folders, scripts, or invariants change without an `ai-docs/` update. Agents **must** treat keeping it current as part of the change, not a follow-up.

Whenever you change the project, in the **same change**:

1. Check which `ai-docs/` pages describe what you touched (start from [`ai-docs/directory-mirror/INDEX.md`](ai-docs/directory-mirror/INDEX.md), plus playbooks and [`ai-docs/scripts-and-commands.md`](ai-docs/scripts-and-commands.md) if scripts or commands moved).
2. Update those pages so they still match the tree (paths, invariants, paired tests, scripts, CODEOWNERS, `NODE_ENV` behaviour, and so on).
3. If you add, rename, or remove a **top-level or major directory**, add/rename/remove the matching mirror page and an INDEX row.
4. If you add or change a Yarn script or `bin/` helper, update `scripts-and-commands.md` (and the relevant mirror page).
5. If nothing in `ai-docs/` is affected, say so briefly in the summary — do not skip the check.

Do not finish a task with a stale `ai-docs/` tree. This is in addition to updating human `docs/` and this file when those topics change.

Suggested first reads inside `ai-docs/`:

- [`ai-docs/pre-change-protocol.md`](ai-docs/pre-change-protocol.md)
- [`ai-docs/do-not.md`](ai-docs/do-not.md)
- [`ai-docs/directory-mirror/INDEX.md`](ai-docs/directory-mirror/INDEX.md)
- [`ai-docs/scripts-and-commands.md`](ai-docs/scripts-and-commands.md)
- [`ai-docs/conventions.md`](ai-docs/conventions.md)
- [`ai-docs/playbooks/ui-preview-missing-data.md`](ai-docs/playbooks/ui-preview-missing-data.md) — empty preview pages (`£NaN`, `Invalid DateTime`, empty tables)
- [`ai-docs/service-assessment.md`](ai-docs/service-assessment.md) — Service Standard / Technology Code of Practice (TCoP) / Design System deviation checklist

## Project overview

- His Majesty’s Courts and Tribunals Service (**HMCTS**) **Civil Citizen UI (CUI)** — citizen-facing civil money claims web app
- **Express 5** + **TypeScript** + **Nunjucks** + **GOV.UK Frontend** (not NestJS / not a Single Page Application (SPA))
- Server-side HTTP clients to civil-service, general application (GA) service, Identity and Access Management (IDAM), Document Management (DM) store, etc.
- Redis draft store (ioredis) / session (`connect-redis` + official `redis` client); LaunchDarkly feature flags; i18next (English / Welsh)
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
- **UI Preview (no Identity and Access Management, IDAM):** `yarn preview` (or `yarn start:ui-preview`) → rebuilds, frees ports, starts Docker stack, prints **http://localhost:3001/ui-preview** (`compose/ui-preview.yml`, `bin/ui-preview.sh`)
  - Distinct from `yarn start:dev` (real Redis + OpenID Connect (OIDC))
  - Fixture user id: `someID`
  - Fixture claims: `1645882162449409` (awaiting defendant), `1645882162449601` (full admit by instalments), `1645882162449602` (part admit by instalments), `1645882162449603` (case progression), `1645882162449604` (general application), `1645882162449605` (defendant part admit + statement of means)
  - Preview-only WireMock stubs: `compose/ui-preview-mappings/` — keep them out of `charts/civil-citizen-ui/wiremock/mappings`, which is the validated reduced-stack contract set (`yarn wiremock:validate` forbids broad matchers)
  - Stop: `yarn start:ui-preview:down`
  - **HTTP 200 is not a useful page.** Empty tables, `£NaN`, Luxon `Invalid DateTime`, `Created []`, or leaked keys (`PAGES.…undefined`) mean missing Core Case Data (CCD) / Redis fields or a missing production-safe fallback — not a broken Nunjucks file. Seed `compose/ui-preview-mappings/` **and** `uiPreviewRedisData.json` when the GET reads that store; add a real fallback when the live journey can omit a query string (for example general-application `?appFee=`). Do not hard-code sample citizen copy in templates to fill preview. Mapping JSON: restart WireMock. Redis / TypeScript / Nunjucks: rebuild `citizen-ui`. Checklist: [`ai-docs/playbooks/ui-preview-missing-data.md`](ai-docs/playbooks/ui-preview-missing-data.md)

## Before changing code

1. Sync with upstream `hmcts` first:
   - If the working tree is not clean, ask for confirmation (or create a branch) before syncing
   - `git fetch hmcts`
   - `git pull --rebase hmcts master`
2. Prefer focused, minimal diffs that match existing style

## Dependencies

- **Every** `dependencies`, `devDependencies`, and `resolutions` entry must be an **exact version** (no `^`, `~`, `>`, `<`, `*`, `x`, or `||`). `engines.node` may stay a minimum range. Yarn `patch:` protocol is allowed for resolutions that apply a local patch.
- Prefer **patch and minor** updates unless explicitly asked for latest/major
- Prefer versions published at least **7 days** ago for routine updates (security fixes may skip the wait). Yarn enforces this on resolve via `npmMinimalAgeGate: 10080` in `.yarnrc.yml` (7 × 24 × 60 minutes). To install a same-day security release, set `YARN_NPM_MINIMAL_AGE_GATE=0` for that command only.
- Refresh `yarn.lock` with `YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install` after pin changes.
- Avoid introducing breaking changes; verify installs with `yarn install`
- When updating **multiple** packages in one task: update all targets and refresh the lockfile, then run tests once
- After dependency update prompts: apply the bump, then run `yarn deps:check`, `yarn deps:audit`, and the full coverage suite (`yarn test:coverage`); if anything breaks, tell the user first, then fix
  - **Segmentation violation (SIGSEGV) / Jest worker crash:** re-run the failed suite alone; if it passes, the update is complete — do **not** re-run the full suite. Test scripts pass `--no-sparkplug` to avoid the known V8 GC crash (see Testing and coverage)
  - Long coverage or install runs: do not block a single wait for many minutes — run in the background and poll until complete (see [Long-running commands](#long-running-commands))

### Why exact pins, SHA checksums, and a 7-day cooldown

- **Pins:** a range (`^1.2.3`) lets a later `yarn install` on a clean machine pull a different patch or minor. That is how silent breaking changes, new network calls, and extra telemetry get into a citizen-facing service without a reviewed change. Exact pins make upgrades a deliberate diff.
- **SHA checksums:** `yarn.lock` stores a SHA-512 (Secure Hash Algorithm) checksum (`checksum: 10/<hex>`) for every resolved npm tarball. `.yarnrc.yml` sets `checksumBehavior: throw`, so a swapped or truncated archive cannot install. `yarn deps:check` fails continuous integration (CI) if a direct specifier is a range or a non-optional lockfile entry lacks a checksum. GitHub Actions also sets `YARN_ENABLE_HARDENED_MODE=1` so install re-checks lockfile resolutions against the registry (lockfile poisoning).
- **7-day cooldown:** newly published npm versions can still be unpublished, and malware in a hijacked maintainer account is often noticed within days, not minutes. Waiting a week is a simple, automated control (Yarn age gate + policy). It is not a substitute for `yarn deps:audit` (`yarn npm audit`). Security patches may skip the wait as above.
- **Renovate:** `.github/renovate.json` sets `rangeStrategy: pin`, `minimumReleaseAge: 7 days`, and extends HMCTS `automerge-minor` (not `automerge-all`). Major updates and `govuk-frontend` do not automerge. Renovate PRs (`renovate/*` or `renovate[bot]`) run `yarn deps:check`, `yarn deps:audit`, and `yarn test:coverage` in `.github/workflows/ci.yml`. Do not re-add `automerge-all` or ranged bumps.

Reasons and CI wiring: [`docs/security-and-privacy.md`](docs/security-and-privacy.md). Commands: `yarn deps:check`, `yarn deps:audit`.

## Package-only updates (auto origin sync)

If the change is **only** version bumps in `package.json` / `yarn.lock` (no other code changes), once checks pass:

1. `git fetch origin`
2. `git pull --rebase origin master`
3. `git push origin master` (or `git push --force-with-lease origin master` only when history was rebased)

## Server / application stack

For server and application logic, use this repository’s platform stack — not one-off frameworks.

- Keep application code under **`src/main/`** using existing conventions — do not invent a parallel runtime (NestJS apps, SPA frameworks, ad-hoc Node servers, etc.)
- Prefer **Express** building blocks already in the app: routers/controllers under `src/main/routes/`, middleware/modules under `src/main/modules/`, guards under `src/main/routes/guards/`
- Prefer **TypeScript** end-to-end: typed models, form classes, and service APIs — avoid untyped `any`-heavy helpers or plain JS server modules unless there is a clear, documented exception
- Prefer **services** in `src/main/services/` for business logic and content builders; keep controllers thin (validate → call service → render/redirect)
- Prefer existing **HTTP clients** in `src/main/app/client/` for civil-service / general application (GA) / Protected Characteristics Questionnaire (PCQ) / service-to-service (S2S) — do not invent a second HTTP stack
- Prefer **Redis draft store / session** helpers in `src/main/modules/draft-store/` over ad-hoc persistence or inventing a new database layer unless explicitly required
- Prefer **class-validator** form models under `src/main/common/form/` and existing validators over one-off validation
- Reuse existing config (`config/`), logging, internationalisation (i18n), and error-handling patterns instead of new bespoke frameworks
- If choosing an alternative stack piece, document **why** in the change — do not bypass the CUI stack casually
- Do **not** introduce NestJS, Prisma, React/Vue/Angular, or a second template engine unless the user explicitly requests it

## GOV.UK Frontend

Pinned dependency: **`govuk-frontend@6.4.0`** (see `package.json`; bump docs when upgrading).

- **GOV.UK Frontend is the single source of truth** for the user interface
- All GOV.UK Design System component HTML must come from official Nunjucks macros — do not hand-write component markup when a macro exists
- Prefer `{% from "govuk/components/.../macro.njk" import ... %}`; layout chrome (skip link, header, footer, breadcrumbs, pagination, table, inset text, tabs, summary list, tag, task list, details) must use macros. Do not wrap `govukRadios` in a second `<fieldset>`.
- Typography/layout utilities (`govuk-heading-*`, `govuk-body`, `govuk-grid-*`, `govuk-!-*-*`) are fine for composition; component structure still comes from macros
- Client-side UI should show/hide or populate **macro-rendered** markup rather than building GOV.UK component HTML in JavaScript
- Prefer GOV.UK Frontend HTML, CSS, and JS over **axe** / **axe-core** when they conflict (document/disable the scanner rule; do not rewrite GOV.UK)
- Interactivity via **app JS overrides only** (`src/main/assets/js/`); keep GOV.UK Frontend init; do not edit `node_modules/govuk-frontend`
- Theming via **app SCSS/CSS overrides only** (`src/main/assets/scss/`); do not fork vendor CSS
- Reuse Nunjucks partials and GOV.UK macros under `src/main/views/`; **do not duplicate shared journey markup** — extract shared partials instead
- **HTML fixture accuracy:** every component’s official macros must match the release `fixtures.json` HTML ([GOV.UK docs](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files)). Suite: `yarn test:govuk-fixtures` (`src/test/unit/govukFrontend/`)
- After GOV.UK Frontend upgrades, do not finish until:
  1. Macros (not vendor forks) absorb HTML/CSS/JS fallout
  2. `yarn build`
  3. `yarn test:govuk-fixtures` (must pass)
  4. `yarn test` and relevant focused Jest
  5. `yarn tests:a11y` where practical
  6. Broader functional / Playwright security when the upgrade is large and env allows
  7. Spot-check home, claim issue, response, dashboard if automation misses a layout
  8. Version notes in README / `docs/` / this file when they mention GOV.UK Frontend
  Dependabot/Renovate GOV.UK bumps are not complete until those checks pass (or a documented exception).

## Service assessment (GOV.UK / HMCTS)

CUI is a **transactional** citizen service. Code changes must not make a [service assessment](https://www.gov.uk/service-manual/service-assessments) harder to pass.

- Human snapshot (what “passing” means, 14 Service Standard points, TCoP, HMCTS stack, Design System, fixture HTML): [`docs/service-assessment.md`](docs/service-assessment.md)
- Agent checklist (deviations vs aligned recommendations): [`ai-docs/service-assessment.md`](ai-docs/service-assessment.md)
- Official pages remain canonical. If they disagree with those snapshots, believe the live page and update both files in the same change.
- You **cannot** iterate away live **accessibility** (Web Content Accessibility Guidelines (WCAG) 2.2 AA), **security/privacy**, or **technology lock-in**. Do not introduce a citizen SPA, hand-written GOV.UK components, or unexplained AI decisioning.
- Do not claim the service “passes” from git history alone. Do flag when a proposal **deviates** from the Service Standard, TCoP, [HMCTS way](https://hmcts.github.io/), or [GOV.UK Design System](https://design-system.service.gov.uk/).

## Performance and accessibility

Treat **frontend performance**, **backend/API efficiency**, and **accessible UI** as top priorities on every change.

- Frontend: avoid unnecessary JS/assets; prefer progressive enhancement on macros
- Backend: avoid N+1 civil-service calls; reuse draft-store helpers; watch Redis time to live (TTL)/key design
- Accessibility: preserve GOV.UK focus, labels, error summaries, and skip-link behaviour; do not break GOV.UK to silence axe
- Call out residual performance or accessibility (a11y) risks in summaries

## Documentation and code comments

- Keep **all** project documentation accurate when behaviour, versions, remotes, tooling, or standards change (README, `AGENTS.md`, changelogs, human `docs/`)
- **Always update `ai-docs/` in the same change** when the project tree, scripts, or invariants change — see [Keep `ai-docs/` in sync](#keep-ai-docs-in-sync-mandatory)
- Document **why** for non-obvious decisions; after dependency or GOV.UK upgrades, sync version notes
- Expand acronyms **on first use in each document**: Full name (ACRONYM), for example Single Page Application (SPA). Canonical list: [`docs/glossary.md`](docs/glossary.md). **GOV.UK** is a brand name and is not expanded.
- Use **TSDoc-compatible** `/** */` comments: summary first, `@remarks` for longer constraints, `{@link}` / `@see` / `@deprecated` when useful
- **Do not** put TypeScript types in JSDoc braces (`@param {string} x` is wrong in `.ts`); use `@param x - Description`
- **Do not** use `@module`, `@requires`, `@class`, `@function`, or `@async` tags
- Write **comprehensive comments** on public modules/classes and non-trivial functions: purpose, behaviour, side effects, security/performance/GOV.UK constraints
- Annotate Nunjucks where macros are composed or client scripts depend on macro-rendered markup
- Explain **why** and constraints — not a line-by-line restatement of obvious code
- When changing code, update nearby comments and related docs in the same change
- Before finishing:
  1. Human docs (`docs/`, README, this file) confirmed still accurate
  2. **`ai-docs/` updated in the same change**, or explicitly confirmed unaffected
  3. Public/complex APIs have up-to-date TSDoc-compatible comments (no typed `{Type}` braces)
  4. This file updated if a standing convention changed

## Testing and coverage

- Jest unit tests (`src/test/unit`), Jest integration (`src/integration-test`), CodeceptJS functional, Playwright security, Pact contracts, Pa11y accessibility (a11y)
- After **server TypeScript** changes, run type-check/build and relevant tests and **fix compile errors** in the same change — prefer real types over `any` / `@ts-ignore`
- Useful commands:
  - `yarn test` — Jest unit tests
  - `yarn test:govuk-fixtures` — GOV.UK Frontend macro HTML vs release fixtures.json
  - `yarn test:coverage` — Jest with coverage of all `src/main` TypeScript/JavaScript (not only imported files); `coverageThreshold` fails the run if the global floor drops
  - `yarn test:integration` / `yarn test:routes` — route integration tests
  - `yarn build` — webpack assets
  - `yarn lint` — ESLint 10 flat config (`eslint.config.mjs`) + stylelint; Windows: `yarn lint:win`
  - `yarn deps:check` — exact pins + lockfile SHA checksums
  - `yarn deps:audit` — `yarn npm audit` vs `yarn-audit-known-issues`; production tree must be clean
  - `yarn test:functional` — CodeceptJS functional (needs env)
  - `yarn tests:a11y` — Pa11y accessibility (Jenkins runs `tests:a11y:parallel`; not part of `yarn cichecks`)
  - Playwright security specs under `playwright/tests/`
- All Jest entry points run through `node --no-sparkplug ./node_modules/jest/bin/jest.js`. Sparkplug plus the `vm` module Jest uses to execute test files triggers a V8 13.6 garbage-collector segfault in `ClearStaleLeftTrimmedPointerVisitor`, which kills a random worker mid-run ([nodejs/node#62393](https://github.com/nodejs/node/issues/62393), still present in Node 24.18.0). Jest forks workers with the parent's `execArgv`, so setting the flag on the entry point covers them. Keep the flag when editing test scripts, and do not move it into `NODE_OPTIONS` — Node rejects V8 flags there.

## Git and commits

- Do **not** create commits unless the user asks
- Do **not** push unless the user asks, except the package-only auto-push rule above
- Never update git config; avoid destructive git commands unless explicitly requested
- Never use interactive git flags (`-i`)
- Never attach **AI coding-agent** identity to commits or pushes (no `Co-Authored-By` / `Co-authored-by` trailers naming an agent or product, no spoofed author/committer, no hook-injected agent trailers). Use only the user’s configured git identity. If a tool would add agent metadata, strip it before committing or pushing.
- **Never invent JIRA / ticket IDs** (e.g. `DTSCCI-1234`, `CIV-999`) in commit messages, PR titles, branch names, or docs. Only include a ticket key when the user explicitly provides it. If none is given, write a normal message without a ticket prefix

## Long-running commands

Do not block a single wait on `yarn test:coverage`, large installs, or similar for many minutes. Start them in the background and poll until they finish (or fail). Prefer matching known output (for example `Test Suites:`) so a wait can end early. Short commands (git, focused Jest, lint smoke) may run in the foreground.

## Communication

- Be direct and concise
- Summaries must include **risks** and **unresolved issues**

## Related files

| File | Purpose |
|------|---------|
| `ai-docs/README.md` | Agent directory mirror, playbooks, scripts, pre-change protocol |
| `ai-docs/playbooks/ui-preview-missing-data.md` | Empty or broken `yarn preview` pages (seed CCD/Redis vs production fallbacks) |
| `ai-docs/conventions.md` | Index of standing conventions (points here) |
| `docs/glossary.md` | Acronyms expanded on first use (HMCTS, LiP, IDAM, CCD, …) |
| `ai-docs/service-assessment.md` | Service Standard / TCoP / Design System — flag deviations |
| `docs/service-assessment.md` | What passing a GOV.UK service assessment means (mapped to CUI) |
| `KEYCHANGES.md` | This fork compared with upstream `hmcts/civil-citizen-ui` `master` |
| `FRONTEND-RECOMMENDATIONS.md` | Frontend recommendations (macros, progressive enhancement, fixtures, jQuery removal) |
| `docs/README.md` | Human project documentation (architecture, journeys, testing, CI) |
| `docs/contributing.md` | Human contributing guide (same conventions) |
