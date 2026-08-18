# Civil Citizen UI documentation

This folder is the project guide for **civil-citizen-ui** (CUI): the HMCTS citizen-facing web application for specified civil money claims.

The root [README.md](../README.md) covers getting started, GitHub preview labels, and auto-generated functional-test tables, and links here from its Documentation section. The documents in this folder explain how the repository is organised, how a request flows through the app, which services it talks to, and how to develop, test, and deploy it.

## Read in this order

1. [Project overview](project-overview.md) — what CUI is, who it serves, runtime and ownership
2. [Architecture](architecture.md) — request lifecycle, layers, and design constraints
3. [Directory structure](directory-structure.md) — map of the repository
4. [Local development](local-development.md) — install, run, UI Preview, Docker
5. [Configuration](configuration.md) — `node-config`, environment variables, Redis TTLs
6. [Citizen journeys](citizen-journeys.md) — claim issue, response, claimant response, GA, and related flows
7. [Frontend](frontend.md) — Nunjucks, GOV.UK Frontend, assets, i18n
8. [Integrations](integrations.md) — civil-service, IDAM, Redis, LaunchDarkly, payments, documents
9. [Security and privacy](security-and-privacy.md) — CSRF, Helmet, OIDC, PII logging
10. [Testing](testing.md) — Jest, fixtures, functional, Playwright, Pact, a11y
11. [CI/CD and deployment](ci-cd-and-deployment.md) — Jenkins, Helm, GitHub Actions
12. [Service assessment](service-assessment.md) — Service Standard, TCoP, HMCTS stack, Design System (what “passing” means)
13. [Contributing](contributing.md) — coding standards and agent guidance

## Specialised notes already in this folder

| Document | Topic |
| --- | --- |
| [Reduced-stack WireMock contracts](reduced-stack-wiremock-contracts.md) | Consumer-owned mappings packaged in the Helm chart |
| [Functional test diagnostics](functional-test-diagnostics.md) | Jenkins failure summaries and Allure artefacts |
| [PII logging PR check](pii-logging-check.md) | Semgrep rules for names, contact details, and financial values |
| [Dependency update log 2026-08-18](dependency-update-log-2026-08-18.md) | Record of a bulk dependency pass (completed and blocked bumps) |

See also the root [KEYCHANGES.md](../KEYCHANGES.md) for a fork-vs-upstream comparison (tooling, tests, security, documentation).

## Related files outside this folder

| Path | Role |
| --- | --- |
| [README.md](../README.md) | Quick start, preview labels, generated test tables |
| [KEYCHANGES.md](../KEYCHANGES.md) | Fork vs `hmcts/civil-citizen-ui` `master` — tooling, tests, security, docs |
| [AGENTS.md](../AGENTS.md) | Canonical standing conventions for any coding agent (symlink: `AGENT.md`) |
| [ai-docs/README.md](../ai-docs/README.md) | **AI-only** directory mirror, playbooks, and scripts (not a human product guide) |
| [catalog-info.yaml](../catalog-info.yaml) | Backstage component metadata (`dts_civil`) |
