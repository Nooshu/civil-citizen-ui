# Civil Citizen UI documentation

This folder is the project guide for **civil-citizen-ui** (Civil Citizen UI, **CUI**): the His Majesty’s Courts and Tribunals Service (**HMCTS**) citizen-facing web application for specified civil money claims.

Unfamiliar acronyms are expanded on first use in each page (for example Single Page Application (SPA)). Full list: [glossary](glossary.md).

The root [README.md](../README.md) covers getting started, GitHub preview labels, and auto-generated functional-test tables, and links here from its Documentation section. The documents in this folder explain how the repository is organised, how a request flows through the app, which services it talks to, and how to develop, test, and deploy it.

## Read in this order

1. [Glossary](glossary.md) — expand acronyms on first use; HMCTS, LiP, IDAM, CCD, and the rest
2. [Project overview](project-overview.md) — what CUI is, who it serves, runtime and ownership
3. [Architecture](architecture.md) — request lifecycle, layers, and design constraints
4. [Directory structure](directory-structure.md) — map of the repository
5. [Local development](local-development.md) — install, run, user interface (UI) Preview, Docker
6. [Configuration](configuration.md) — `node-config`, environment variables, Redis time to live (TTL)
7. [Citizen journeys](citizen-journeys.md) — claim issue, response, claimant response, general application (GA), and related flows
8. [Frontend](frontend.md) — Nunjucks, GOV.UK Frontend, assets, internationalisation (i18n)
9. [Integrations](integrations.md) — civil-service, Identity and Access Management (IDAM), Redis, LaunchDarkly, payments, documents
10. [Security and privacy](security-and-privacy.md) — Cross-Site Request Forgery (CSRF), Helmet, OpenID Connect (OIDC), personally identifiable information (PII) logging
11. [Testing](testing.md) — Jest, fixtures, functional, Playwright, Pact, accessibility (a11y)
12. [Continuous integration and delivery (CI/CD) and deployment](ci-cd-and-deployment.md) — Jenkins, Helm, GitHub Actions
13. [Service assessment](service-assessment.md) — Service Standard, Technology Code of Practice (TCoP), HMCTS stack, Design System (what “passing” means)
14. [Contributing](contributing.md) — coding standards and agent guidance

## Specialised notes already in this folder

| Document | Topic |
| --- | --- |
| [Reduced-stack WireMock contracts](reduced-stack-wiremock-contracts.md) | Consumer-owned mappings packaged in the Helm chart |
| [Functional test migration matrix](functional-test-migration-matrix.md) | Reduced-stack vs full-stack ownership (`@reduced-stack`) |
| [Functional test diagnostics](functional-test-diagnostics.md) | Jenkins failure summaries and Allure artefacts |
| [PII logging PR check](pii-logging-check.md) | Personally identifiable information (PII) Semgrep rules for names, contact details, and financial values |
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
