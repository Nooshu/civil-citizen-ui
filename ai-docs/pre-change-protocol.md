# Pre-change protocol (agents)

Follow this before editing application code. Skip only if the user explicitly forbids git network operations or the working tree is already on a dedicated branch they named.

## 1. Sync upstream

See [`AGENTS.md`](../AGENTS.md) — Before changing code.

- If the working tree is **not clean**, ask before syncing, or work on a branch.
- Add remote if missing: `git remote add hmcts git@github.com:hmcts/civil-citizen-ui.git`
- `git fetch hmcts`
- `git pull --rebase hmcts master`

Default branch is `master`. Push/pull for the fork is `origin` unless you are syncing upstream.

## 2. Match the runtime

```bash
nvm use          # Node >=24.18.0 (.nvmrc)
# Yarn 4 via .yarnrc.yml — never switch the task to npm
```

Do not delete `yarn.lock`. Immutable installs are on (`.yarnrc.yml` `enableImmutableInstalls: true`). Intentional lockfile edits: `YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install`.

## 3. Identify the blast radius

Open [change-impact-matrix.md](change-impact-matrix.md) and the [directory mirror](directory-mirror/INDEX.md) for every path you will touch.

Typical Civil Citizen UI (CUI) change spans **four layers** that must stay aligned:

1. `src/main/routes/urls.ts` — canonical path
2. Controller under `src/main/routes/features/<journey>/` registered in `src/main/routes/routes.ts`
3. Service / translator under `src/main/services/`
4. Nunjucks under `src/main/views/features/<journey>/` plus `en.json` / `cy.json`

Plus a unit test that mirrors the path under `src/test/unit/`.

## 4. Apply stack and UI constraints

- Express + TypeScript under `src/main/` only — `AGENTS.md` Server / application stack. Do not recommend a citizen Single Page Application (SPA) (His Majesty’s Courts and Tribunals Service (HMCTS) + Service Standard 11).
- GOV.UK **macros** for components — `AGENTS.md` GOV.UK Frontend. Flag deviations: [`service-assessment.md`](service-assessment.md). Acronyms: [`docs/glossary.md`](../docs/glossary.md).
- App JS in `src/main/assets/js/` only — never `node_modules/govuk-frontend`
- App SCSS in `src/main/assets/scss/` only
- Reuse Nunjucks partials — `AGENTS.md` GOV.UK Frontend
- axe does not override GOV.UK — `AGENTS.md` GOV.UK Frontend

## 5. Comments and docs

`AGENTS.md` — Documentation and code comments:

- TSDoc `/** */`, summary first, `@param name - description` with **no `{Type}` braces**
- No `@module`, `@requires`, `@class`, `@function`, `@async`
- Update human `docs/` when behaviour or versions change
- **Always update `ai-docs/` in the same change** (or confirm it is unaffected) — `AGENTS.md` “Keep `ai-docs/` in sync”

## 6. Verify

| You changed | Minimum verification |
| --- | --- |
| Server TypeScript | Focused Jest on the module + fix compile errors (`AGENTS.md` Testing and coverage) |
| Routes / middleware | `yarn test:integration` as well as unit tests |
| Nunjucks / GOV.UK / macros | `yarn test:govuk-fixtures` after Frontend or Nunjucks-env changes; `yarn build` if webpack entries/SCSS/JS changed |
| Chart WireMock mappings | `yarn wiremock:validate` and `yarn test:wiremock-contracts` |
| Dependencies | `yarn deps:check` then `yarn test:coverage` after all bumps (`AGENTS.md` Dependencies) |
| Logging | No PII; see `docs/pii-logging-check.md` and `.semgrep/` |

Long Jest: run in the background and poll until complete — `AGENTS.md` Long-running commands.

Jest **SIGSEGV**: re-run the **one** failed file. If it passes, stop. Do not re-run full coverage. Keep `--no-sparkplug` on Jest scripts; never put that V8 flag in `NODE_OPTIONS`.

## 7. Git

- No commit unless asked
- No push unless asked (exception: package-only auto-push rule in `AGENTS.md`)
- No `git config` changes, no `-i`, no `--no-verify`
- No `Co-Authored-By` trailers naming an AI agent or product — `AGENTS.md` Git and commits
- No invented JIRA ids — `AGENTS.md` Git and commits

## 8. Summaries

Always include **risks** and **unresolved issues**. Call out Redis TTL/key design, extra civil-service round-trips, and leftover a11y/performance risks.
