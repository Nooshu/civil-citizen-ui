# `src/main/routes/` — controllers, URLs, guards

## Files at this level

| File | Rule |
| --- | --- |
| `urls.ts` | **Only** place for path strings used by the app. Export constants. New screens add a constant here first. |
| `routes.ts` | Imports every controller and **calls** `someController(app)` (or equivalent). A controller that is never invoked here is dead. |
| `homeController.ts`, `unauthorisedController.ts`, `info.ts`, `tabs.ts` | Home, unauthorised, info, tab helpers |
| `calculateMonthlyIncomeExpense/` | JSON endpoint for income/expense totals (used by `assets/js/calculate-*.js`) |
| `common/` | Shared route helpers |

Human journey map: [`docs/citizen-journeys.md`](../../docs/citizen-journeys.md).

## URL prefixes (do not invent parallel trees)

| Prefix | Journey folder |
| --- | --- |
| `/claim` | `features/claim` — Redis draft, no case id yet |
| `/eligibility`, `/first-contact` | `features/public` — Cross-Site Request Forgery (CSRF) skipped; OpenID Connect (OIDC) public |
| `/dashboard` | `features/dashboard` |
| `/case/:id/response` | `features/response` |
| `/case/:id/claimant-response` | `features/claimantResponse` |
| `/case/:id/general-application` | `features/generalApplication` (applicant). Submit confirmation uses `?appFee=` in pounds when present; otherwise `claim.generalApplication.applicationFee.calculatedAmountInPence`. `?id=` is the GA case id, not the claim id. |
| `/case/:id/response/general-application/:appId` | General application (GA) respondent |
| `/case/:id/case-progression` | `features/caseProgression` |
| `/case/:id/mediation` | `features/mediation` |
| `/case/:id/directions-questionnaire` | `features/directionsQuestionnaire` |
| `/oauth2/callback` | OIDC |
| `/ui-preview` | `features/uiPreview` — e2eTest |

## Controller style

Thin: parse params/body → form validate → service → `res.render` / `res.redirect`.

- Render Nunjucks names matching `views/` (no file extension in many `res.render` calls — follow neighbours).
- Pass `t` / internationalisation (i18n) as existing controllers do; do not hard-code user copy.
- Include error summary data for GOV.UK `govukErrorSummary`.

## `features/` folders (keep names aligned with services/views)

`claim`, `response`, `claimantResponse`, `dashboard`, `caseProgression`, `directionsQuestionnaire`, `mediation`, `generalApplication`, `queryManagement` (`/case/:id/qm/view-query` reads `claim.queries.caseMessages` from civil-service; UI Preview `1645882162449603` seeds ten sample threads), `judgmentOnline`, `settlementAgreement`, `document`, `helpWithFees`, `claimAssignment`, `contact`, `public`, `uiPreview`.

## `guards/`

Express middleware. Path-prefix guards are attached in `app.ts` (e.g. `claimantIntentGuard` on claimant-response base, `statementOfMeansGuard`, `trialArrangementsGuard`, `isGAForLiPEnabled`, upload rate limit on query management (QM) / case progression (CP) / mediation / general application (GA) uploads).

| Guard (examples) | Protects |
| --- | --- |
| `claimIssueTaskListGuard` | Claim issue task jumping |
| `claimantIntentGuard` | Claimant response |
| `statementOfMeansGuard` | Statement of means (SoM) nested routes |
| `allResponseTasksCompletedGuard` / CYA guards | Submit / CYA |
| `claimFeePaymentGuard` | Fee payment |
| `pcqGuard` / `pcqGuardClaim` | PCQ |
| `uploadRateLimitGuard` | Redis-backed rate limit. `sendRedisCommand` uses ioredis `.call`, or the command name as a method on `ioredis-mock`. |
| `generalAplicationGuard.ts` (spelling is historical) | GA LiP enabled |
| `deleteGAGuard`, `checkYourAnswersGAGuard` | GA specifics |
| `trackHistory.ts`, `GaTrackHistory.ts` | Back-link / journey history |

Do not bypass guards for convenience in production paths. Tests may skip some when `NODE_ENV=test`.

## Tests

`src/test/unit/routes/` mirrors controllers and guards. Many import `{app}` + supertest — slow under coverage; still the right pattern for HTTP status/redirects.

Integration: `src/integration-test/routes/<journey>/`.

## After adding a route

1. `urls.ts`
2. Controller + `routes.ts` registration
3. Guard in `app.ts` if it is a prefix
4. OIDC allowlist if public
5. Unit test
6. i18n + view (see views page)
