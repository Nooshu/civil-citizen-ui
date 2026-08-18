# Glossary

Expand acronyms **on first use in each document**: write the full name, then the short form in brackets — for example Single Page Application (SPA). After that, the short form is fine.

This page is the onboarding list for people who have not worked in government or on this service before. Official GOV.UK / HMCTS pages remain canonical if a term moves.

**Do not expand** the brand **GOV.UK**. Product names such as Yarn, Jest, Nunjucks, Redis, WireMock, Pa11y, Playwright, Helm, and Renovate stay as names.

## This service and HMCTS

| Term | Meaning |
| --- | --- |
| **CUI** | Civil Citizen UI — this citizen-facing web app |
| **HMCTS** | His Majesty’s Courts and Tribunals Service |
| **MoJ** | Ministry of Justice |
| **DTS** | Digital and Technology Services (MoJ / HMCTS digital organisation; Backstage owner `dts_civil`) |
| **CFT** | Civil, Family and Tribunals (HMCTS platform grouping; Jenkins folder prefix `cft:`) |
| **LiP** / **LiPs** | Litigant in person / litigants in person — people using the court without a solicitor |
| **LR** | Legal representative (solicitor or firm acting for a party) |
| **GA** | General application — asking the court for a procedural order after a claim exists (not Google Analytics) |
| **CCD** | Core Case Data — the case record store; civil-service exposes CCD-shaped JSON |
| **IDAM** | Identity and Access Management — login, tokens, citizen accounts |
| **OIDC** | OpenID Connect — the login protocol CUI uses with IDAM |
| **S2S** | Service-to-service — microservice tokens from service-auth-provider |
| **DM store** | Document Management store — claim documents and uploads |
| **PCQ** | Protected Characteristics Questionnaire — equality / diversity questions (separate HMCTS service) |
| **ExUI** / **xui** | Expert UI — the professional-user (solicitor/staff) frontend, not this citizen app |
| **CMC** / **OCMC** | Civil Money Claims / Online Civil Money Claims — earlier money-claims services this app coexists with |
| **CARM** | Civil Automated Referral to Mediation — free telephone mediation, flag-gated (`cam-enabled-for-case`) |
| **MINTI** | Multi and Intermediate Track — civil claim tracks above small claims |
| **NoC** | Notice of Change — a solicitor taking over or leaving a case |
| **NRO** | National roll-out (feature flags such as `cui-ga-nro`) |
| **DQ** | Directions questionnaire — questions that help the court list a hearing |
| **HWF** | Help with Fees |
| **CYA** | Check your answers |
| **CCJ** | County Court Judgment |
| **SSA** | Settlement agreement (in functional-test names) |
| **Camunda** | Workflow engine used by civil-service (BPMN/DMN definitions pulled via `bin/`) |
| **BPMN** / **DMN** | Business Process Model and Notation / Decision Model and Notation |
| **AAT** | HMCTS acceptance / pre-production environment (`aat.platform.hmcts.net`) — not an acronym we invent beyond that |
| **CNP** | Cloud Native Platform — HMCTS Jenkins pipeline file `Jenkinsfile_CNP` |
| Term | Meaning |
| --- | --- |
| **CNBC** | Civil National Business Centre — contact-centre web chat in this app |

## Government standards and design

| Term | Meaning |
| --- | --- |
| **TCoP** | Technology Code of Practice |
| **WCAG** | Web Content Accessibility Guidelines (this service targets **2.2 AA**) |
| **AA** | WCAG conformance level Double-A |
| **GDS** | Government Digital Service |
| **SPA** | Single Page Application (React/Vue/Angular-style; **not** the HMCTS citizen stack) |
| **SSR** | Server-side rendering (Express + Nunjucks here) |
| **KPI** | Key performance indicator |
| **COTS** | Commercial off-the-shelf software |
| **TCO** | Total cost of ownership |
| **OSS** | Open-source software |
| **IP** | Intellectual property |

## Security, privacy, and HTTP

| Term | Meaning |
| --- | --- |
| **PII** | Personally identifiable information (names, contact details, claim amounts, and similar) |
| **CSRF** | Cross-Site Request Forgery |
| **CSP** | Content Security Policy |
| **CORS** | Cross-Origin Resource Sharing |
| **XSS** | Cross-Site Scripting |
| **IDOR** | Insecure Direct Object Reference |
| **JWT** | JSON Web Token |
| **HMAC** | Hash-based Message Authentication Code (used for PCQ tokens) |
| **TOTP** | Time-based One-Time Password (functional tests vs S2S) |
| **TLS** | Transport Layer Security |
| **SHA** | Secure Hash Algorithm (`yarn.lock` stores SHA-512 checksums) |
| **VPN** | Virtual private network |
| **SDK** | Software development kit |

## Engineering (used constantly in this repo)

| Term | Meaning |
| --- | --- |
| **UI** | User interface |
| **UX** | User experience |
| **API** | Application programming interface |
| **BFF** | Backend for frontend — CUI’s role: it does not own the case database |
| **TTL** | Time to live (Redis key expiry) |
| **i18n** | Internationalisation (English and Welsh here) |
| **a11y** | Accessibility (the “11” is the letters between a and y) |
| **CI** / **CD** | Continuous integration / continuous delivery |
| **PR** | Pull request |
| **E2E** / **e2e** | End-to-end |
| **QA** | Quality assurance |
| **LTS** | Long-term support (Node release line) |
| **ESM** | ECMAScript modules (`import` / `export`) |
| **IDE** | Integrated development environment |
| **OS Places** | Ordnance Survey Places — postcode lookup (not “operating system”) |
| **GTM** | Google Tag Manager |
| **RESP3** | Redis Serialization Protocol version 3 (`ioredis` 6 default) |
| **SIGSEGV** | Segmentation violation — a native crash (Jest + Sparkplug on Node 24) |
| **LCP** | Largest Contentful Paint — a loading-performance metric |
| **PoC** | Proof of concept |

## Testing tags you will see in README tables

Those tables are **generated** — do not hand-edit them. The same expansions apply when you read them:

| Term | Meaning |
| --- | --- |
| **LiP** | Litigant in person |
| **GA** | General application |
| **CARM** | Civil Automated Referral to Mediation |
| **DQ** | Directions questionnaire |
| **CYA** | Check your answers |
| **NoC** | Notice of Change |

See also [project overview](project-overview.md) (what CUI is) and [integrations](integrations.md) (which systems it talks to).
