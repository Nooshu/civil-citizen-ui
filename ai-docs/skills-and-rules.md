# Skills, Cursor rules, and when to use them

## Always-applied project rules

These live in [`.cursor/rules/`](../.cursor/rules/) (`.mdc`). They are **canonical**. This `ai-docs/` folder must not contradict them.

| File | Trigger / topic |
| --- | --- |
| `project-standards.mdc` | Node/Yarn, **sync `hmcts` before code changes**, origin auto-push for package-only bumps, summary risks |
| `dependency-pinning.mdc` | Exact pins, 7-day cooldown, `yarn.lock`, **full `yarn test:coverage` after dep bumps**, SIGSEGV isolation |
| `shell-wait-limits.mdc` | Never block a shell wait > 60s; background long jobs |
| `prefer-express-typescript-stack.mdc` | Express/TS under `src/main/`; no Nest/Prisma/SPA |
| `govuk-frontend-ui.mdc` | Macros are the only GOV.UK component HTML |
| `govuk-frontend-upgrade-tests.mdc` | After `govuk-frontend` bumps: build + fixtures + unit + a11y |
| `prefer-govuk-over-axe.mdc` | Design System wins vs axe |
| `govuk-frontend-js-overrides.mdc` | App JS only in `src/main/assets/js/` |
| `govuk-frontend-theming-overrides.mdc` | App SCSS only in `src/main/assets/scss/` |
| `reuse-nunjucks-partials.mdc` | No duplicated journey markup |
| `performance-and-accessibility.mdc` | FE perf, API cost, a11y on every change |
| `verify-ts-build-after-server-changes.mdc` | Fix TS/Jest compile errors in the same change |
| `docs-and-comments.mdc` | Docs + TSDoc (no `{Type}` braces); **must update `ai-docs/` in the same change** |
| `no-cursor-agent-commits.mdc` | No agent co-author / author |
| `no-invented-jira-ids.mdc` | No guessed ticket keys |

Standing narrative: [`AGENTS.md`](../AGENTS.md) (`AGENT.md` is a symlink).

There are **no project skills** under `.cursor/skills/` in this repository today. Do not invent a parallel instruction set there unless the user asks to create a skill.

## Cursor / user skills that help *this* repo (invoke when the user asks)

These are not in the git repo; they are Cursor skills. Use them when the user request matches — **read the skill file first**.

| Skill | When it is useful here |
| --- | --- |
| **create-rule** | User wants a new `.cursor/rules/*.mdc` (e.g. a new GOV.UK or test invariant) |
| **create-skill** | User wants a project skill under `.cursor/skills/` (e.g. “add a CUI screen”) |
| **review-bugbot** | User **explicitly** asks for a Bugbot-like review of local changes |
| **review-security** | User **explicitly** asks for a security review of local changes |
| **split-to-prs** | User asks to split this work into small PRs (CUI PRs are often journey-sized) |
| **update-cursor-settings** | Editor settings only — not application code |
| **automate / create-hook / loop** | Recurring agent workflows the user requested |
| **canvas** | Only if the user wants a visual analytical artifact, not for CUI Nunjucks work |
| **sdk** | Only if wiring `@cursor/sdk` / external agents — not this Express app |

Do **not** launch Bugbot or Security Review subagents unless the user explicitly asked.

## Suggested project skills (not created unless asked)

If the user later wants `.cursor/skills/`, high-value ones for CUI would be:

1. **add-cui-screen** — urls.ts → controller → service → form → Nunjucks macros → i18n EN+CY → unit test → optional guard
2. **govuk-macro-page** — layout extend, `govukErrorSummary`, CSRF include, no hand-rolled components
3. **ccd-translator-change** — `services/translation` + client + unit test + WireMock only if reduced-stack create-claim
4. **dependency-bump** — exact pin, 7-day check, install, `yarn test:coverage`, SIGSEGV rule

Until those exist, follow [pre-change-protocol.md](pre-change-protocol.md) and [change-impact-matrix.md](change-impact-matrix.md).

## Useful one-liners to run (not skills)

```bash
# focused unit test
yarn test -- src/test/unit/routes/features/<journey>/<file>.test.ts

# GOV.UK HTML accuracy
yarn test:govuk-fixtures

# chart WireMock
yarn wiremock:validate && yarn test:wiremock-contracts

# lint
yarn lint
```

Human docs to pair with skills: [`docs/contributing.md`](../docs/contributing.md), [`docs/testing.md`](../docs/testing.md), [`docs/frontend.md`](../docs/frontend.md).
