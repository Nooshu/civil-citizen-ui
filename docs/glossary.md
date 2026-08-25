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
| **DM** / **DM store** | Document Management store — claim documents and uploads |
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
| **CNBC** | Civil National Business Centre — contact-centre web chat in this app |
| **QM** | Query management — citizen messages to the court on a case (`/qm` routes; flag `cui-query-management`) |
| **CP** | Case progression — the journey after directions (`/case/:id/case-progression`): evidence, hearing fee, bundles |
| **COSC** | Certificate of Satisfaction or Cancellation — confirming a County Court Judgment (CCJ) debt is paid |
| **RFR** | Request for reconsideration — asking the court to look again at a case-progression order |
| **FRC** | Fixed recoverable costs — cost-banding questions on the directions questionnaire |
| **SDO** | Standard Directions Order — the order that typically starts case progression (evidence and hearing) |
| **SoM** | Statement of means — defendant’s income, expenses, and similar in the response journey |
| **DOB** | Date of birth |
| **WA** | Work Allocation — HMCTS service that assigns work; switched off in reduced-stack preview |
| **WLU** | Welsh Language Unit — functional-test scenarios that mix Welsh and English query management |
| **N245** | Court form N245 (vary a judgment) — a form number, not an acronym |
| **DPA** | In Ordnance Survey Places JSON, **Delivery Point Address** (the address object). Not the Data Protection Act unless a privacy page says so |

## Government standards and design

| Term | Meaning |
| --- | --- |
| **TCoP** | Technology Code of Practice |
| **WCAG** | Web Content Accessibility Guidelines (this service targets **2.2 AA**) |
| **AA** | WCAG conformance level Double-A |
| **GDS** | Government Digital Service |
| **MoJ Frontend** | The npm package `@ministryofjustice/frontend`. **Not used** in Civil Citizen UI (CUI). Repeatable rows are app JS (`initAddAnother` / `initAppendRow`). See [moj-frontend.md](moj-frontend.md). |
| **SS** | Service Standard — the 14-point GOV.UK standard used in a service assessment |
| **AI** | Artificial Intelligence — including generative models. Do not add unexplained AI decisioning to this citizen service |
| **SPA** | Single Page Application — a web app (typically React, Vue, or Angular) that loads once and then updates the page in the browser with JavaScript, instead of the server sending a new HTML page for each screen. His Majesty’s Courts and Tribunals Service (HMCTS) **citizen** services, including this one, are Express + Nunjucks **server-side rendering (SSR)**, not SPAs. Professional users (solicitors) use Angular in Expert UI. |
| **SSR** | Server-side rendering — the server builds the HTML (here Express + Nunjucks) and the browser displays it. Progressive-enhancement JavaScript may run afterwards. Contrast with a Single Page Application (SPA). |
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
| **CVE** | Common Vulnerabilities and Exposures — a published security advisory identifier |
| **PIN** | Personal identification number — first-contact claim access before full login |
| **AJAX** | Asynchronous JavaScript and XML — here, a JavaScript request that updates the page without a full reload (Find address). The name is historical; the payload is JSON |
| **JIRA** | Atlassian issue tracker (product name). **DTSCCI** and **CIV** are ticket project keys, not words to expand — never invent ticket numbers |

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
| **CommonJS** | Node’s `require` / `module.exports` module system (contrast ESM) |
| **GC** | Garbage collection — V8 memory management (Sparkplug plus Jest can SIGSEGV on Node 24) |
| **CRLF** | Carriage Return + Line Feed — Windows line endings (`\r\n`) |
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
| **QM** | Query management |
| **SDO** | Standard Directions Order |
| **WLU** | Welsh Language Unit |
| **COSC** | Certificate of Satisfaction or Cancellation |
| **HWF** | Help with Fees |

See also [project overview](project-overview.md) (what CUI is) and [integrations](integrations.md) (which systems it talks to).
