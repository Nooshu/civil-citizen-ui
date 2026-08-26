# `src/main/services/` — business logic and Core Case Data (CCD) mapping

Controllers must stay thin. **Rules, check-your-answers (CYA) builders, task lists, fee maths, and CCD mapping live here.**

## Layout

```text
services/
├── features/          # per-journey (mirrors routes/features)
├── translation/       # CUI ↔ CCD
├── dashboard/         # dashboard-specific (also features/dashboard)
├── caseDocuments/
├── firstcontact/
├── genericForm/
└── commons/           # shared GA/claim helpers
```

### `features/`

| Folder | Typical contents |
| --- | --- |
| `claim/` | Draft claim, interest, check answers, payment confirmation |
| `response/` | Response type, admissions, statement of means (SoM), defence, submit confirmation |
| `claimantResponse/` | Intent, County Court Judgment (CCJ), settlement, task list, confirmation |
| `caseProgression/` | Evidence upload, trial arrangements, hearing fee, bundles, request for reconsideration (RFR) |
| `directionsQuestionnaire/` | Experts, witnesses, fixed recoverable costs (FRC), Multi and Intermediate Track (MINTI) disclosure |
| `mediation/` | Civil Automated Referral to Mediation (CARM) / telephone mediation, document upload |
| `generalApplication/` | Types, hearings, N245, fees, Certificate of Satisfaction or Cancellation (COSC), respondent, written reps. Submit confirmation interpolates `applicationFee` in pounds: `?appFee=` from check-your-answers, else `applicationFee.calculatedAmountInPence` on the draft (UI Preview `1645882162449604` is `10800` → **£108**), including COSC `/general-application/cosc/submit-general-application-confirmation`. Copy and the pay URL omit `appFee` when the value is not finite so the page cannot show `£NaN`. Respondent captions (`getRespondToApplicationCaption`) map CCD labels or enum keys and fall back to **Respond to an application** when the type is missing — do not interpolate `RESPOND_TO.undefined`. |
| `queryManagement/` | Create query, check your answers (CYA), view threads. UI Preview case `1645882162449603` seeds ten `queries.caseMessages` parent threads (sent, received, and closed) so the view-query table is populated. |
| `dashboard/` | Claim summary / latest update **content builders** |
| `helpWithFees/`, `judgmentOnline/`, `settlementAgreement/`, `document/`, `eligibility/`, `feePayment/`, `uiPreview/` | Catalogue + fixture claim IDs for `yarn preview`. Extra claims: `uiPreviewRedisData.json` + `compose/ui-preview-mappings/`. Admit Redis fixtures need `claimantResponse` (getClaimById reads Redis first), an INSTALMENTS defendant `repaymentPlan` for **How they want to pay**, a claimant `suggestedPaymentIntention.repaymentPlan` for **Your payment plan**, and `paymentIntention.paymentDate` for **Court offered set date**. Statement-of-means screens need defendant `PART_ADMISSION`/`FULL_ADMISSION` plus a non-immediate payment option (`1645882162449605`); WireMock CCD seeds `specDefenceAdmittedRequired: No` and owed **£400**. Mediation settlement on `1645882162449409` seeds `mediationAgreement`. The catalogue lists only GETs that render the intended template with those fixtures (no PIN-gated first-contact summary, no unregistered URLs, no CYA that redirect to incomplete-submission). Grow it by fixing 500s and empty interpolations, not by adding links toward a count. Query details uses parent id `qm-9603-hearing`. |

Content builders return objects for Nunjucks (summary rows, task lists). Reuse `services/features/common/` (e.g. support-required lists) instead of copying.

### `translation/`

**Load path:** CCD JSON → Civil Citizen UI (CUI) models (`convertToCUI/`, plus claim/response/general application (GA)/mediation/judgmentOnline/caseProgression folders). GA `applicationTypes` on CCD is a display label (`Strike out`); `displayToEnumKey` also accepts the enum key (`STRIKE_OUT`).

**Submit path:** CUI models → CCD (`convertToCCD*` under `translation/response`, `claim`, `claimantResponse`, `generalApplication`, …).

If civil-service/CCD adds a field:

1. Type in `common/models`
2. Converter here
3. Unit test under `src/test/unit/services/translation/`
4. Client if a new endpoint
5. WireMock only for reduced-stack create-claim

Do not map CCD in controllers.

## Tests

`src/test/unit/services/` — **prefer these over app-importing route tests** for business rules. Mock `draftStoreService` and HTTP clients.

## Performance

Section builders that each call civil-service or Redis for the same claim are an N+1 smell. Pass the `Claim` / `CivilClaimResponse` down.
