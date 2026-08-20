# Service assessment and government standards

**Audience:** humans and coding agents. Official GOV.UK / His Majesty’s Courts and Tribunals Service (HMCTS) pages remain the **live** source of truth. This file is a **dated snapshot** (18 August 2026) of what those pages require, mapped onto Civil Citizen UI (CUI), so a future change can be judged against “would this make a service assessment harder?” Acronyms: [glossary](glossary.md).

If a live page and this snapshot disagree, **believe the live page**, then update this file and [`ai-docs/service-assessment.md`](../ai-docs/service-assessment.md) in the same change.

Agent-oriented checklist (deviations, do-nots): [`ai-docs/service-assessment.md`](../ai-docs/service-assessment.md). Standing code conventions: [`AGENTS.md`](../AGENTS.md).

## What a service assessment is

A **service assessment** is a peer review by experienced specialists (typically a lead assessor, user researcher, designer, technical lead, sometimes a performance analyst). It checks whether a **transactional** public service meets the [Service Standard](https://www.gov.uk/service-manual/service-standard).

CUI is transactional: users exchange information and submit personal data that changes a government record (civil money claims). Central government transactional services **must** be assessed, including internal civil-servant services. Panels are cross-government if the service is likely to exceed **100,000 transactions per year** or is used by more than one organisation; otherwise departmental.

**What is assessed:** the transaction this team built, **plus** evidence that the team understands the user’s wider journey and is joining up with it. Problems elsewhere in government do not automatically fail the service if the team is taking reasonable steps to improve the journey in increments.

**What happens:** about four hours. First ~30 minutes: overview of users and the problem, then a walkthrough of the real product (not only the happy path — ineligible users, missing evidence, offline support). Remaining time: questions. There is **no fixed question list**; it depends on the service and phase (alpha / private beta / public beta / live).

**Results:**

| Result | Meaning |
| --- | --- |
| **Green** | Standard met; may continue to the next phase |
| **Amber** | Not yet met, but not critical; may continue while fixing, usually within ~3 months, with a tracking document |
| **Red** | Critical gaps; stay in the current phase and reassess those points. Red is **not** “you failed as a team” |

Departmental panels may use **met / not met** instead. Cross-government reports are published after fact-check.

### What “passing” actually means

Whether the standard is met is a **matter of judgement**. Guidance distinguishes:

- Problems you **can iterate out of** (imperfect UX, incomplete journeys) — do not block release if research is happening.
- Problems you **cannot iterate out of** once real users are on the service:
  - **accessibility** must already meet the legal standard
  - the service must be **secure** and must not put government or user data at risk
  - contracts and technology must not lock the team into something that **cannot be iterated**

Beta assessments typically also probe: safe frequent deploys, cookies, open source, open standards and common platforms, availability, testing, Design System use, published performance data, and a funded research plan.

Official: [What happens at a service assessment](https://www.gov.uk/service-manual/service-assessments/how-service-assessments-work), [How to apply the Service Standard](https://www.gov.uk/service-manual/service-assessments/how-to-apply-the-service-standard), [Check if you need an assessment](https://www.gov.uk/service-manual/service-assessments/check-if-need-to-meet-service-standard), [How the beta phase works](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works).

## Service Standard (14 points)

Canonical: [Service Standard](https://www.gov.uk/service-manual/service-standard). The [Service Manual](https://www.gov.uk/service-manual) is the how-to (user research, design, agile, technology, accessibility, the team).

| # | Point | What assessors look for | How this shows up in CUI |
| --- | --- | --- | --- |
| 1 | [Understand users and their needs](https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs) | Research, prototypes, analytics; full user context, not a pre-chosen solution | Product/research work lives outside this repo. Code must not invent journeys that ignore claimant/defendant/litigant in person (LiP) context. |
| 2 | [Solve a whole problem](https://www.gov.uk/service-manual/service-standard/point-2-solve-a-whole-problem) | Scope around what users need; join up with other orgs; do not design around a stack, commercial off-the-shelf (COTS), or generative AI | CUI is one transaction in civil money claims. Do not add a parallel product or AI “assistant” that becomes the design. Reuse civil-service / Core Case Data (CCD) rather than a second backend. |
| 3 | [Joined-up channels](https://www.gov.uk/service-manual/service-standard/point-3-join-up-across-channels) | Online + phone/paper/face-to-face; do not hide offline channels to force digital take-up | Code cannot replace operations, but copy and error messages must stay usable if a user later phones. Do not remove contact/help paths to “simplify” the UI. |
| 4 | [Simple to use](https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use) | First-time success; test with users; devices they actually use; **look like GOV.UK**; [style guide](https://www.gov.uk/guidance/style-guide) | Official Nunjucks macros; one thing per page where the Design System pattern exists; GOV.UK content style in `en.json` / `cy.json`. |
| 5 | [Everyone can use it](https://www.gov.uk/service-manual/service-standard/point-5-make-sure-everyone-can-use-the-service) | Accessibility (online **and** offline); research with disabled people; assisted digital | **Web Content Accessibility Guidelines (WCAG) 2.2 AA** is the Service Manual requirement ([Understanding WCAG 2.2](https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag)). Pa11y (`yarn tests:a11y`), GOV.UK skip link / labels / error summaries, Welsh where flagged. Do not break GOV.UK to silence axe. |
| 6 | [Multidisciplinary team](https://www.gov.uk/service-manual/service-standard/point-6-have-a-multidisciplinary-team) | Right mix of skills; AI needs someone who understands it | Org, not this repo. Do not add AI features without that capability. |
| 7 | [Agile](https://www.gov.uk/service-manual/service-standard/point-7-use-agile-ways-of-working) | Inspect, learn, adapt; agile governance | Small reversible PRs; tests that allow frequent release. |
| 8 | [Iterate frequently](https://www.gov.uk/service-manual/service-standard/point-8-iterate-and-improve-frequently) | Capacity to improve live, not only patch | Exact pins + coverage so upgrades are possible; avoid lock-in (Nest, proprietary Single Page Application (SPA), unmaintainable forks of GOV.UK). |
| 9 | [Secure service, privacy](https://www.gov.uk/service-manual/service-standard/point-9-create-a-secure-service) | [Secure by Design](https://www.security.gov.uk/policy-and-guidance/secure-by-design/); due diligence on third-party software; collect/store data with respect for privacy; test controls | Helmet/Content Security Policy (CSP), Cross-Site Request Forgery (CSRF), OpenID Connect (OIDC), personally identifiable information (PII) logging + Semgrep, upload rate limits, Playwright API security, dependency pins + Secure Hash Algorithm (SHA) checksums. No PII in logs. |
| 10 | [Success metrics](https://www.gov.uk/service-manual/service-standard/point-10-define-success-publish-performance-data) | Metrics that show the problem is solved; central government **must** publish mandatory key performance indicators (KPIs) | Analytics/App Insights exist; **publishing** KPIs is organisational. Do not add tracking that undermines privacy. |
| 11 | [Right tools](https://www.gov.uk/service-manual/service-standard/point-11-choose-the-right-tools-and-technology) | Cost-effective; understand the stack (including AI); total cost of ownership (TCO); avoid lock-in; manage legacy; inclusion and reliability of decisions | HMCTS citizen stack: **Node + Express server-side rendering (SSR)** (not Angular, not a SPA). TypeScript, Yarn, current Node long-term support (LTS). See HMCTS section below. |
| 12 | [Open source](https://www.gov.uk/service-manual/service-standard/point-12-make-new-source-code-open) | Write in the open; keep intellectual property (IP); open licence; no secrets | Upstream `hmcts/civil-citizen-ui` is public. Do not commit secrets. Closed-source only for credentials, unpublished policy, fraud-detection algorithms. |
| 13 | [Open standards and common patterns](https://www.gov.uk/service-manual/service-standard/point-13-use-common-standards-components-patterns) | GOV.UK Design System; share new patterns; APIs; do not publish personal data as open data | Macros, not hand-rolled components. Contribute findings upstream rather than forking GOV.UK. |
| 14 | [Reliable](https://www.gov.uk/service-manual/service-standard/point-14-operate-a-reliable-service) | Uptime; frequent deploys without downtime; quality assurance (QA) **not left only to automation**; monitor user outcomes and bias, not only crashes | Health endpoint, Jenkins, Helm, App Insights. Unit/integration/functional/accessibility (a11y). Do not treat `yarn test` as the only QA. |

## Technology Code of Practice (TCoP)

Canonical: [Technology Code of Practice](https://www.gov.uk/guidance/the-technology-code-of-practice) (spend controls and Local Digital Declaration). Consider **all** points; align with **mandatory** ones. Point **13** is: if you are building a service, you **also** meet the Service Standard.

| # | Point | CUI implication |
| --- | --- | --- |
| 1 | Define user needs | Same as Service Standard 1 |
| 2 | Accessible and inclusive | Same as Service Standard 5; WCAG 2.2 AA |
| 3 | [Be open and use open source](https://www.gov.uk/guidance/be-open-and-use-open-source) | Prefer mature open-source software (OSS); publish code; total cost including exit; do not treat “free” as zero cost |
| 4 | Open standards | HTTP/JSON to civil-service; GOV.UK Frontend HTML; no proprietary UI kit |
| 5 | Cloud first | Platform/Helm; do not invent an on-prem runtime in this app |
| 6 | Make things secure | Helmet, CSRF, pins, checksums, age gate |
| 7 | Privacy integral | PII redaction, no logging of names/amounts, cookies with consent patterns |
| 8 | Share, reuse, collaborate | Reuse CUI patterns, civil-service clients, GOV.UK — do not duplicate another department’s claim UI |
| 9 | Integrate and adapt | Existing IDAM, Redis, CCD translators — no second HTTP stack |
| 10 | Better use of data | Draft store and CCD; do not hoard PII in Redis beyond TTL policy |
| 11 | Purchasing strategy | Org/spend control; in code: avoid vendor lock-in |
| 12 | Sustainable technology | Keep Node LTS current; do not leave unmaintained deps on ranges |
| 13 | Meet the Service Standard | This whole document |

## HMCTS engineering standards

Canonical hub: [The HMCTS way](https://hmcts.github.io/). New applications use the [recommended technology stack](https://hmcts.github.io/standards/technology-stack/):

| Layer | Recommended |
| --- | --- |
| Frontend — **citizen** | **Node.js (Express / other SSR)** |
| Frontend — professional user | Angular |
| API | Java |
| Database | PostgreSQL |

CUI is a **citizen** frontend. [Frontend practices](https://hmcts.github.io/standards/practices/frontend.html) (reviewed 11 May 2026):

- Express SSR, **not** a citizen SPA
- GOV.UK Design System + GOV.UK Frontend (or a derivative such as HMCTS Frontend)
- Current Node **LTS**; Deno not recommended
- Dependabot or Renovate; npm **or** Yarn
- TypeScript for new work
- Latest Chrome, Edge, Firefox, Safari; responsive layout
- ESLint (and optionally Prettier)
- Pa11y for accessibility (page currently says WCAG **2.1** AA; **Service Standard / legal bar is WCAG 2.2 AA** — prefer 2.2)
- Playwright or Cypress for browser tests
- CSP and CSRF

Do **not** “modernise” CUI into Angular or React: that would deviate from the HMCTS citizen stack **and** from Service Standard 11/13.

## GOV.UK Design System and GOV.UK Frontend

### Design System (what users see)

Canonical: [GOV.UK Design System](https://design-system.service.gov.uk/). [Get started](https://design-system.service.gov.uk/get-started/): use published styles, components, and patterns; read the research notes on each page; do not treat GitHub discussions as tested guidance.

CUI is on a **service.gov.uk** style host, so it **must look like GOV.UK**: design principles, Design System patterns, [content style guide](https://www.gov.uk/guidance/style-guide), phase banner in alpha/beta, GOV.UK Frontend for typeface and components. If research shows a pattern fails users, you may adapt or create one — but an assessment will demand **evidence**. Do not use the crown/logotype/Government Digital Service (GDS) Transport/brand colours on something that is **not** GOV.UK. Official: [Making your service look like GOV.UK](https://www.gov.uk/service-manual/design/making-your-service-look-like-govuk).

### GOV.UK Frontend (how we implement it)

Canonical: [GOV.UK Frontend docs](https://frontend.design-system.service.gov.uk/). Track the **latest** [release on GitHub](https://github.com/alphagov/govuk-frontend/releases/latest) and pin that exact version in `package.json`. Install via the Node package; use **Nunjucks macros** (not copied precompiled HTML in production); Dart Sass; `initAll` / `createAll` with `type="module"`; do not run GOV.UK JS in unsupported browsers without the `js-enabled` / `govuk-frontend-supported` snippet. CSP must allow that snippet (hash or nonce) — CUI already uses nonces.

**HTML must match the release fixtures.** For each component, `node_modules/govuk-frontend/dist/govuk/components/<name>/fixtures.json` lists `options` and expected `html`. Pass `options` into the official macro and compare. Ignore only documented framework differences (whitespace). Do not use `hidden` fixtures for visual regression. Official: [Test if your HTML matches GOV.UK Frontend](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files). In this repo: `yarn test:govuk-fixtures`.

### If the assessor examines frontend code (team checklist)

Government Digital Service (GDS) expectations show up as Service Standard points **4**, **5**, **11**, and **13**. Day-to-day frontend guide: [`frontend.md`](frontend.md). Recommendations: [`FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md).

| What assessors probe | What the development team must show |
| --- | --- |
| Does it look like GOV.UK? | Official Design System macros; no hand-written component chrome; content style guide in locales |
| Is Frontend current and maintained? | Exact pin aligned with the [latest GitHub release](https://github.com/alphagov/govuk-frontend/releases/latest); upgrade checklist completed |
| How do you know HTML matches the Design System? | Green `yarn test:govuk-fixtures` in CI; fix fallout via macros, not forks |
| Progressive enhancement / JS | Server-rendered Nunjucks; app JS enhances macro DOM; `initAll()`; forms work without JS where the journey allows |
| Accessibility | WCAG 2.2 AA; Pa11y (`yarn tests:a11y`); skip link, labels, error summaries, keyboard (including tabs) preserved; GOV.UK wins over axe |
| Right tools / no lock-in | Express + Nunjucks citizen SSR — not a citizen SPA |
| Where did you diverge? | Written rationale (and research) for any non-standard pattern |
| Secure UI delivery | CSP nonces; no `unsafe-inline`; CSRF on POSTs |

Do not claim a “pass” from the repo alone. Do treat a PR that weakens any row above as **assessment risk**.

## Accessibility bar (non-negotiable for live users)

From beta onward, regular accessibility testing is expected; an **audit** is expected before beta assessment; publish an accessibility statement for public beta.

WCAG 2.2 AA (perceivable, operable, understandable, robust): alternatives for non-text; logical headings; not colour-only; contrast; reflow; keyboard; skip link; visible focus; no unexpected flashing; consistent components; associated form errors; assistive-tech-friendly status messages. Prefer GOV.UK macros because they encode much of this. See [Understanding WCAG 2.2](https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag).

## What this repository cannot prove

Assessors will still ask about user research, assisted digital, call-centre scripts, letters, published KPIs, spend control, and team composition. Those artefacts are **not** in this git tree. Agents must not claim the service “passes” because the code is tidy. They **can** say a proposed change **deviates from** or **supports** the parts of the standard that *are* implemented here.

## Official URLs (re-scrape if policy moves)

- [Technology Code of Practice](https://www.gov.uk/guidance/the-technology-code-of-practice)
- [Service Manual](https://www.gov.uk/service-manual)
- [Service Standard](https://www.gov.uk/service-manual/service-standard)
- [Service assessments](https://www.gov.uk/service-manual/service-assessments)
- [The HMCTS way](https://hmcts.github.io/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/)
- [GOV.UK Frontend latest release (GitHub)](https://github.com/alphagov/govuk-frontend/releases/latest)
- [HTML fixture tests](https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files)
