# Service assessment — agent checklist

**Use this** whenever you recommend a stack change, a new UI pattern, a dependency, analytics, AI, or anything that would show up in a service assessment. Human explanation and full point-by-point mapping: [`docs/service-assessment.md`](../docs/service-assessment.md) (snapshot **18 August 2026**). Live pages win if they disagree; then update both files.

CUI is a **central-government transactional citizen service**. Assessors judge the **Service Standard**. Some failures **cannot be iterated away** once real users are on the service: **accessibility**, **security/privacy**, and **technology lock-in**. Acronyms: [`docs/glossary.md`](../docs/glossary.md).

Do not claim the service “passes an assessment” from this repo alone. Do say, clearly, when a proposal **deviates** from the standard, Technology Code of Practice (TCoP), His Majesty’s Courts and Tribunals Service (HMCTS) stack, or Design System.

## When a recommendation is a deviation

Flag as a **deviation** (and prefer not to do it unless the user explicitly accepts the assessment risk):

| Proposal | Why it fails or weakens an assessment |
| --- | --- |
| React / Vue / Angular / Single Page Application (SPA) for Civil Citizen UI (CUI) | HMCTS **citizen** frontends are Node **Express server-side rendering (SSR)**. Angular is for **professional** users. Service Standard 11 + [HMCTS stack](https://hmcts.github.io/standards/technology-stack/) |
| Hand-written `govuk-button` / error summary / header HTML | Service Standard 4 and 13; [look like GOV.UK](https://www.gov.uk/service-manual/design/making-your-service-look-like-govuk); [fixture HTML tests](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files) |
| Fork `node_modules/govuk-frontend` or vendor CSS/JS | Same; upgrades and fixture tests become impossible |
| Build GOV.UK component markup in client JS | Progressive enhancement / Frontend JS docs; assistive tech |
| Drop Pa11y / skip-link / error summary / visible focus | Service Standard 5; **Web Content Accessibility Guidelines (WCAG) 2.2 AA** (not optional). HMCTS frontend page still says 2.1 — **prefer 2.2** |
| Rewrite GOV.UK output to satisfy axe | Design System is the tested pattern; document the axe rule instead |
| NestJS, Prisma, second HTTP client, new database | Lock-in and duplication (SS 8/11, TCoP 8/9); CUI already has Express, civil-service clients, Redis drafts |
| Generative AI as the journey or an unexplained decision engine | SS 2 (do not design around AI), SS 6 (need someone who understands it), SS 11 (inclusion and reliability of decisions), SS 14 (monitor bias) |
| Ranges (`^`) on npm dependencies, unsigned/unchecksummed installs | SS 9 due diligence on third-party software; TCoP 6; this repo’s pin + SHA policy |
| Personally identifiable information (PII) in logs, `unsafe-inline` Content Security Policy (CSP), skipped Cross-Site Request Forgery (CSRF) on new POSTs | SS 9; cannot iterate this away in live |
| Secrets in git | SS 12 exception is credentials — they stay **out** of the public repo |
| Hiding phone/paper/help to force digital take-up | SS 3 |
| New tracking/analytics without a privacy basis | SS 9 and 10 |
| Publishing claim/party data as “open data” | SS 13 explicitly forbids PII / sensitive data |

## When a recommendation *supports* an assessment

Prefer and cite these as **aligned**:

- Official **Nunjucks macros** + `yarn test:govuk-fixtures` after GOV.UK or macro changes
- App JS in `src/main/assets/js/` calling `initAll` / `createAll` on **macro-rendered** DOM; `type="module"`
- Helmet CSP with **nonces** (Frontend documents hashes/nonces for the inline `js-enabled` snippet)
- CSRF on POSTs; OIDC; PII redaction; Playwright security specs
- Express + TypeScript + Yarn + Node matching `engines` / LTS process
- Exact pins, `yarn.lock` checksums, 7-day age gate, `yarn deps:check`
- i18n EN+CY, GOV.UK typography/layout classes for composition
- Health, Jenkins, tests at more than one layer (unit + a11y + functional) — SS 14 says QA must not be **only** automation, but automation is still required
- Public GitHub source without secrets (SS 12, TCoP 3)

## Questions assessors often ask (tech)

From [beta phase guidance](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works). If your change would make any of these answers worse, say so in the summary:

1. How do you deploy safely and often without disrupting users?
2. How is user data kept safe (auth, CSRF, CSP, cookies)?
3. How is source code open, and what is deliberately closed?
4. What does the toolchain stop you from changing later?
5. Which open standards and common platforms (Design System, IDAM, CCD) do you use?
6. What happens when the service is down?
7. How do you test (including accessibility and security)?
8. How do you use Design System styles/components/patterns — and where did you **diverge**, with research?

## Service Standard cheat-sheet (code-facing)

Full narrative: `docs/service-assessment.md`.

1. Users — do not invent product scope.
2. Whole problem — no parallel apps; no AI-shaped design; reuse existing APIs.
3. Channels — keep help/contact; do not block offline.
4. Simple / looks like GOV.UK — macros, style guide, devices.
5. Inclusive — WCAG 2.2 AA, assisted digital is operational, Welsh where required.
6. Team — do not add AI without expertise.
7. Agile — small, tested change.
8. Iterate — do not freeze the stack.
9. Secure / private — Secure by Design; third-party diligence; researchable security UX.
10. Metrics — do not add covert telemetry.
11. Tools — Express SSR citizen UI; understand TCO.
12. Open code — public minus secrets.
13. Common patterns — Design System; share new patterns; no PII as open data.
14. Reliable — monitoring, deploys, human QA as well as CI.

## TCoP (spend control)

[Technology Code of Practice](https://www.gov.uk/guidance/the-technology-code-of-practice): user needs, accessible, open source, open standards, cloud first, secure, privacy, reuse, integrate, data, purchasing, sustainable, **and** meet the Service Standard. Flag spend-control risk if a change abandons OSS, cloud, or security controls.

## Design System / Frontend (implementation)

- [Design System](https://design-system.service.gov.uk/) — components and patterns with published research.
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) — package, Nunjucks, Sass, JS API.
- Fixtures: `node_modules/govuk-frontend/dist/govuk/components/<component>/fixtures.json` — `options` in, `html` out; skip `hidden` for visual tests.
- Import JS as modules; initialise with `initAll`/`createAll`; do not ship GOV.UK JS as classic scripts to old IE.
- Copying `govuk-frontend.min.css` by hand is for trials; production CUI uses the webpack/Sass pipeline and macros.

## HMCTS

[hmcts.github.io](https://hmcts.github.io/) — citizen = Express SSR; professional = Angular; APIs = Java. [Frontend practices](https://hmcts.github.io/standards/practices/frontend.html): Node LTS, Yarn or npm, TypeScript, Pa11y, Playwright or Cypress, CSP, CSRF, Renovate/Dependabot.

## How to write the recommendation

1. Name the **Service Standard point** (and TCoP / HMCTS / Design System page) that applies.
2. State whether the change **aligns**, **deviates**, or is **out of band** (research, KPIs, letters — not this repo).
3. If it is a hard deviation (table above), refuse or require an explicit user override and list assessment risk.
4. Include residual a11y, privacy, and lock-in risks in the summary.

## Official URLs

Same list as the bottom of [`docs/service-assessment.md`](../docs/service-assessment.md). Re-fetch those pages when advising on a policy change; this checklist is not a substitute for the live manuals.
