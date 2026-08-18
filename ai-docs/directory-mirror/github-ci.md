# CI, Semgrep, GitHub, Jenkins

## `.github/`

| Path | Agent notes |
| --- | --- |
| `workflows/ci.yml` | Node 24: personally identifiable information (PII) Semgrep on pull requests (PRs), `yarn install` (`YARN_ENABLE_HARDENED_MODE=1`), `yarn deps:check`, `yarn deps:audit`, `yarn build`, `yarn wiremock:pull`. Renovate PRs (`renovate/*` or `renovate[bot]`) also run `yarn test:coverage`. Job timeout 90 minutes. |
| `workflows/stale.yml` / `stale-branches.yml` | Hygiene bots |
| `workflows/update-readme-e2e-tables.yml` | Auto-commit README E2E tables on `master` |
| `workflows/update-readme-ftGroup-tables.yml` | Functional group tables |
| `CODEOWNERS` | `*` `@hmcts/civil`; charts/infra admins as listed |
| `renovate.json` | `rangeStrategy: pin`; npm `minimumReleaseAge` 7 days; HMCTS `automerge-minor` (not `automerge-all`). Majors and `govuk-frontend` do not automerge. Security alerts skip the age gate. Do not re-add ranged bumps or major automerge. |
| `PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`, `ISSUE_TEMPLATE.md` | Humans; do not invent JIRA keys in PR titles |

## Jenkins (repo root)

- `Jenkinsfile_CNP` — main Cloud Native Platform (CNP) pipeline (`nodejs`, product `civil`, component `citizen-ui`)
- `Jenkinsfile_nightly` — `@civil-citizen-nightly`

Preview labels: `enable_keep_helm`, `pr-values:fullDeployment`, `pr-values:reducedStack`, `pr-values:skip-functional-tests`, `civilDefinitionBranch:`, `civilServicePr:`, `civilShared:`.

Functional failure artefact: `test-results/functional/functional-failure-summary.json` — [`docs/functional-test-diagnostics.md`](../../docs/functional-test-diagnostics.md).

## `.semgrep/`

PII logging rules: `logging-pii.yml`, language-specific `logging-pii.ts` / `.java`, annotator `annotate.py`. Docs: [`docs/pii-logging-check.md`](../../docs/pii-logging-check.md). ESLint ignores `.semgrep/**`.

Do not log PII even if redaction exists.

## Agent conventions

Canonical standing conventions: [`AGENTS.md`](../../AGENTS.md). Directory-level notes: this `ai-docs/` tree. Do not add editor-specific rule packs. A leftover `.cursor/` folder is not the source of truth — see [`.cursor/README.md`](../../.cursor/README.md).

## `.yarn/`

Yarn 4 release + cache. `enableImmutableInstalls: true`. Commit `.yarn/releases`; ignore cache. Never add `package-lock.json`.

## `.vscode/`

Gitignored locally. Do not rely on workspace settings being in git.

## `.git-config/hooks`

Repo-local hook samples — do not install agent co-author hooks.

## `catalog-info.yaml`

Backstage: owner `dts_civil`, Jenkins `cft:HMCTS_a_to_c/civil-citizen-ui`, Slack `#civil_contact`.
