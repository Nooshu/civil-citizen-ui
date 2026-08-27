# CI/CD and deployment

Acronyms: [glossary](glossary.md). Continuous integration and continuous delivery (CI/CD) for this service.

## GitHub Actions

Workflows under `.github/workflows/`:

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Pull request (PR)/push: personally identifiable information (PII) Semgrep (PRs), `yarn install` (hardened mode), `yarn deps:check`, `yarn deps:audit`, `yarn build`, `yarn wiremock:pull`. Renovate PRs also run `yarn test:coverage`. |
| `stale.yml` | Marks stale issues/PRs (`actions/stale`) |
| `stale-branches.yml` | Stale branch cleanup (`crs-k/stale-branches`) |
| `update-readme-e2e-tables.yml` | Regenerates E2E tables in README on `master` |
| `update-readme-ftGroup-tables.yml` | Regenerates functional-group tables |

`ci.yml` uses Node 24. After install it runs `yarn deps:check` (exact pins + lockfile SHA checksums) and `yarn deps:audit` (`yarn npm audit`, production tree must be clean) with `YARN_ENABLE_HARDENED_MODE=1` on the install step. Pull requests from Renovate (`renovate/*` branches or `renovate[bot]`) also run `yarn test:coverage` so an automerge cannot land a bump that fails the coverage floor. PII scan: Semgrep `1.136.0`, rules in `.semgrep/logging-pii.yml`, annotator `.semgrep/annotate.py`. See [PII logging PR check](pii-logging-check.md) and [Dependencies](security-and-privacy.md).

Renovate (`.github/renovate.json`) extends the HMCTS base config plus **`automerge-minor`** (not `automerge-all`). The Jenkins Library Renovate preset is **not** used (deprecated in favour of global config). It pins specifiers (`rangeStrategy: pin`), waits 7 days after publish, and does not automerge majors or `govuk-frontend`.

Accessibility (a11y) is **not** part of GitHub Actions `ci.yml` or `yarn cichecks`. The real Pa11y suite is `yarn tests:a11y` (alias `yarn test:a11y`). Jenkins Cloud Native Platform (CNP) runs `yarn tests:a11y:parallel`.

## Jenkins

- `Jenkinsfile_CNP` — Cloud Native Platform (CNP) continuous deployment pipeline (`type = nodejs`, `product = civil`, `component = citizen-ui`). Uses HMCTS `Infrastructure` library `2.4.4`.
- `Jenkinsfile_nightly` — Nightly functional (`@civil-citizen-nightly`).

Preview and AAT (HMCTS acceptance / pre-production) behaviour is controlled with **GitHub labels** (also documented in the root README):

| Label | Effect |
| --- | --- |
| `enable_keep_helm` | Keep the preview namespace after the pipeline |
| `pr-values:fullDeployment` | Real downstream components (hearings, Elasticsearch, …). Without it, most calls are mocked. |
| `pr-values:reducedStack` | Civil Citizen UI (CUI) + WireMock only; civil-service/Work Allocation (WA)/buses off. Uses `values.reducedStack.preview.template.yaml`. |
| `pr-values:skip-functional-tests` | Skip functional stage for non-functional changes |
| `civilDefinitionBranch:????` | Core Case Data (CCD) definition branch to import |
| `civilServicePr:????` | Deploy `civil/service:pr-N` and import Camunda from that PR |
| `civilShared:????` | civil-service shared scripts branch |

Do not combine `pr-values:reducedStack` with `pr-values:fullDeployment`.

Functional failures: start with `test-results/functional/functional-failure-summary.json`. See [functional-test-diagnostics.md](functional-test-diagnostics.md).

## Helm

Chart: `charts/civil-citizen-ui`.

Dependencies (from `Chart.yaml`):

- `nodejs` (always)
- `wiremock` (condition)
- `civil-service` (condition)
- `servicebus` / `wa` (conditions; full preview)

Values templates:

- `values.yaml` — base
- `values.preview.template.yaml` — default PR preview (mocked-leaning)
- `values.fullDeployment.preview.template.yaml` — full stack
- `values.reducedStack.preview.template.yaml` — CUI + WireMock PoC
- `values.aat.template.yaml` — AAT

Image is built from `Dockerfile`. UI Preview locally uses `Dockerfile.ui-preview`.

## WireMock in CI versus laptop

| Set | Path | Used by |
| --- | --- | --- |
| Reduced-stack contracts | `charts/civil-citizen-ui/wiremock/mappings` | Preview chart, `yarn test:mocked-functional`, `yarn wiremock:validate` |
| UI Preview stubs | `compose/ui-preview-mappings/` | `yarn preview` only |

`yarn wiremock:pull` refreshes mappings used by some local/CI jobs (`bin/pull-latest-wiremock-mappings.sh`). Do not replace chart contracts with broad preview matchers.

## SonarQube

`sonar-project.properties`:

- `sonar.sources=src/main`
- `sonar.tests=src/test/`
- `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
- Organisation `hmcts`

Coverage exclusions exist for specific files (see the properties file). `yarn sonar-scan` runs `sonar-scanner` when credentials are available.

## Backstage

`catalog-info.yaml` registers the component for the HMCTS portal (`dts_civil`, Jenkins slug annotation).

## Environments (logical)

| Env | Typical use |
| --- | --- |
| PR preview | Feature validation; mocked or full depending on labels |
| AAT | Integration against AAT civil-service / IDAM |
| Demo / preview long-lived | Stakeholder demos (`enable_keep_helm`) |
| Production | Live citizens |

Exact URLs and Key Vault names live in Helm values and the platform, not in this git repo’s application code.

## Keep-alive versus ingress

`server.ts` sets `keepAliveTimeout = 185000` so Node does not RST connections that Traefik still holds. Changing ingress idle timeouts without revisiting this value can bring back intermittent 502s.
