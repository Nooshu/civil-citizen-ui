# Citizen journeys

Civil Citizen UI (CUI) is organised around **journeys**. Each journey has controllers under `src/main/routes/features/<name>/`, services under `src/main/services/features/<name>/`, and Nunjucks under `src/main/views/features/<name>/`. URL constants are centralised in `src/main/routes/urls.ts`. Acronyms: [glossary](glossary.md).

This page describes what each journey is for, not every screen. For exhaustive scenario lists, use the generated tables in the root [README.md](../README.md).

## Public and unauthenticated

| Area | Paths | Notes |
| --- | --- | --- |
| Home | `/`, `/home` | Entry |
| Cookies, privacy, T&Cs, accessibility, contact | `/cookies`, `/privacy-policy`, … | Allowlisted in OpenID Connect (OIDC) middleware |
| Eligibility | `/eligibility/…` | “Can I use this service?” — Cross-Site Request Forgery (CSRF) skipped |
| First contact | `/first-contact/…` | Claim reference + PIN before full login — CSRF skipped |
| UI Preview index | `/ui-preview` | `e2eTest` / `yarn preview` catalogue. Ready fixtures: awaiting defendant, full/part admit by instalments, case progression, GA, statement of means |

## Claim issue (`/claim`)

The claimant builds a **draft** in Redis (no Core Case Data (CCD) case id yet), then submits via civil-service `CREATE_LIP_CLAIM`.

Typical steps: resolving the dispute, claimant/defendant details, amount breakdown, interest, timeline, evidence, help with fees, check answers, fee payment (GOV.UK Pay), confirmation.

Guards such as `claimIssueTaskListGuard` stop users jumping to later tasks. After submit, the user is sent to the dashboard for the new case id.

## Dashboard

`/dashboard` lists the user’s cases. `/dashboard/:id/claimantNewDesign` (and the older `/dashboard/:id/claimant`) is the claim summary: tasks, notifications, documents, hearing information.

Dashboard **scenarios** (what the citizen should do next) are created/updated through civil-service (`CivilServiceClient` dashboard APIs). Whether the redesigned dashboard is used for a case is gated by LaunchDarkly `is-dashboard-enabled-for-case`.

## Defendant response (`/case/:id/response`)

After assignment (`/assignclaim`) the defendant:

1. Confirms details, date of birth (DOB), phone
2. Chooses response type: full admission, part admission, or defence
3. For admissions: payment option (immediately / by date / instalments), statement of means
4. For defence: why you disagree, timeline, evidence
5. Mediation and directions questionnaire where applicable
6. Check answers and submit

Statement of means is nested under `/case/:id/response/statement-of-means/…` (disability, residence, partner, dependants, employment, income, expenses, debts, court orders, …). `statementOfMeansGuard` protects those routes.

## Claimant response (`/case/:id/claimant-response`)

After a defence or admission, the claimant chooses how to proceed: accept a repayment plan, propose their own, settle, or request a County Court Judgment (CCJ). `claimantIntentGuard` applies to the whole base path.

## Mediation

`/case/:id/mediation/…` — free telephone mediation, contact details, availability, document upload. Civil Automated Referral to Mediation (CARM) behaviour is flag-gated (`cam-enabled-for-case`).

## Directions questionnaire

`/case/:id/directions-questionnaire/…` — experts, witnesses, hearing requirements, Welsh language, vulnerability, extra four weeks, fixed recoverable costs / multi-track disclosure when Multi and Intermediate Track (MINTI) applies (`multi-or-intermediate-track`).

## Case progression

`/case/:id/case-progression/…` — upload evidence, trial arrangements, hearing fee (including help with fees), bundles, request for reconsideration. `trialArrangementsGuard` wraps trial-arrangement URLs.

## General applications

Applicant: `/case/:id/general-application/…`  
Respondent: `/case/:id/response/general-application/:appId/…`

Includes application type, agreement from the other party, hearing arrangements, N245, documents, fees, and Certificate of Satisfaction or Cancellation (COSC) under `/cosc`.

Enabled for litigants in person (LiPs) via `GaForLips`. `isGAForLiPEnabled` guard sits on both general application (GA) bases. Some courts need `ea-courts-whitelisted-for-ga-lips`.

## Query management

Citizen queries on a case (query management (`QM_*`) URLs in `urls.ts`). Gated by `cui-query-management`. Upload endpoints may be rate-limited (`uploadRateLimit`).

## Payments and help with fees

Claim fee, hearing fee, and GA application fee confirmation URLs are allowlisted in OIDC so GOV.UK Pay can return the user without a full re-login dance. Payment session keys live in Redis with a short time to live (TTL) (`paymentSession`).

Help with fees has its own feature folder and guards.

## Judgment, settlement, documents

- Judgment online: `/case/:id/judgment-online/…`
- Settlement agreement: `/case/:id/settlement-agreement/…` (YAML toggle `settlementAgreementEnabled` plus services)
- Document download/view: `/case/:id/…` document controllers using Document Management (DM) store

## Translation layer

CCD JSON is not the same shape as CUI models. `src/main/services/translation/` converts:

- **to CUI** when loading a case (`convertToCUI…`)
- **to CCD** when submitting events (`convertToCCD…`)

When civil-service or CCD fields change, update the client, the translator, unit tests, and (if reduced-stack) WireMock fixtures in the same change.

## Pattern for a new screen

1. Add the path to `urls.ts`.
2. Add a controller under the correct `routes/features/…` folder; register it in `routes.ts`.
3. Put rules and CCD mapping in `services/`.
4. Add a class-validator form in `common/form/` if the page posts data.
5. Add a Nunjucks view that **only** uses GOV.UK / shared macros for components.
6. Add English (EN) and Welsh (CY, Cymraeg) strings in internationalisation (i18n) locales.
7. Add a unit test that imports `app` and uses supertest, plus a service test without the full app where possible.
8. Extend functional coverage if the journey is user-visible in preview/AAT (HMCTS acceptance environment).
