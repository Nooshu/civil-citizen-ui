# Artificial Intelligence (AI)-only documentation (`ai-docs/`)

**Audience: AI coding agents only.** Human-oriented project documentation is [`docs/README.md`](../docs/README.md). Expand acronyms on first use (Full name (ACRONYM)); list: [`docs/glossary.md`](../docs/glossary.md).

If any instruction here conflicts with [`AGENTS.md`](../AGENTS.md), **`AGENTS.md` wins**. Fix this folder in the same change rather than improvising.

## Why this folder exists

The human `docs/` tree explains architecture and journeys. This tree is a **directory mirror**: for every important path in the repo it records what lives there, what you must not break, which tests and scripts to run, which `AGENTS.md` conventions apply, and which neighbouring files usually change together.

## Read order before you change code

1. [`AGENTS.md`](../AGENTS.md) — standing agent rules (Yarn 4, GOV.UK macros, no invented JIRA ids, no agent co-author trailers).
2. This index, then **[pre-change-protocol.md](pre-change-protocol.md)** and **[do-not.md](do-not.md)**.
3. **[change-impact-matrix.md](change-impact-matrix.md)** — pick the row that matches your edit.
4. The matching file under **[directory-mirror/INDEX.md](directory-mirror/INDEX.md)**.
5. Human docs for the domain (`docs/architecture.md`, `docs/citizen-journeys.md`, `docs/service-assessment.md`, …) if you need product or assessment context.
6. The actual source files. Do not edit from this documentation alone.

## Contents

| File | Use when |
| --- | --- |
| [pre-change-protocol.md](pre-change-protocol.md) | Every task that touches the working tree |
| [do-not.md](do-not.md) | Hard prohibitions (stack, GOV.UK, git, secrets, WireMock) |
| [scripts-and-commands.md](scripts-and-commands.md) | Yarn scripts, `bin/` helpers, what to run after which change |
| [conventions.md](conventions.md) | Index of standing conventions (canonical: `AGENTS.md`) |
| [service-assessment.md](service-assessment.md) | Service Standard / TCoP / HMCTS / Design System / Government Digital Service (GDS) frontend checklist — flag deviations |
| [playbooks/govuk-frontend-upgrade.md](playbooks/govuk-frontend-upgrade.md) | `govuk-frontend` bumps — track [latest release](https://github.com/alphagov/govuk-frontend/releases/latest) |
| [path-aliases-and-imports.md](path-aliases-and-imports.md) | `tsconfig` / Jest path aliases (`common/`, `services/`, …) |
| [change-impact-matrix.md](change-impact-matrix.md) | “I changed X → also update Y, run Z” |
| [directory-mirror/INDEX.md](directory-mirror/INDEX.md) | Full directory map with links to per-area notes |
| [playbooks/add-a-screen.md](playbooks/add-a-screen.md) | Adding a citizen page |
| [playbooks/ui-preview-missing-data.md](playbooks/ui-preview-missing-data.md) | Preview GET is 200 but empty/`£NaN`/`Invalid DateTime`/`Created []` |
| [playbooks/dependency-bump.md](playbooks/dependency-bump.md) | Package.json / lockfile bumps |
| [playbooks/moj-frontend.md](playbooks/moj-frontend.md) | MoJ Frontend **removed**; do not re-add `@ministryofjustice/frontend`; Add another is app JS |
| [playbooks/moj-frontend-v10-upgrade.md](playbooks/moj-frontend-v10-upgrade.md) | **Historical stub** — CUI did not stay on MoJ v10; use [playbooks/moj-frontend.md](playbooks/moj-frontend.md) |

## Authority and freshness

- Runtime versions, Node range, GOV.UK Frontend exact pin (`package.json`), and Yarn version: `package.json`, `.nvmrc`, `AGENTS.md` are source of truth. Docs should link the [latest release](https://github.com/alphagov/govuk-frontend/releases/latest) rather than hard-coding a version number. If this folder disagrees, believe those files and update this folder. Human snapshot of current pins, coverage, and catalogue size: [`docs/README.md`](../docs/README.md) (26 August 2026).
- Do not invent ticket keys (`DTSCCI-####`, `CIV-####`) in new text, commits, or branch names.
- Do not commit unless the user asked.
- **Mandatory:** whenever you change the project, update the matching pages in this folder in the **same change** (or confirm in the summary that nothing here is affected). Do not finish with a stale `ai-docs/` tree. Standing instruction: [`AGENTS.md` — Keep `ai-docs/` in sync](../AGENTS.md#keep-ai-docs-in-sync-mandatory).
