# `src/main/services/` — business logic and CCD mapping

Controllers must stay thin. **Rules, CYA builders, task lists, fee maths, and CCD mapping live here.**

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
| `response/` | Response type, admissions, SoM, defence, submit confirmation |
| `claimantResponse/` | Intent, CCJ, settlement, task list, confirmation |
| `caseProgression/` | Evidence upload, trial arrangements, hearing fee, bundles, RFR |
| `directionsQuestionnaire/` | Experts, witnesses, FRC, MINTI disclosure |
| `mediation/` | CARM / telephone mediation, document upload |
| `generalApplication/` | Types, hearings, N245, fees, COSC, respondent, written reps |
| `queryManagement/` | Create query, CYA |
| `dashboard/` | Claim summary / latest update **content builders** |
| `helpWithFees/`, `judgmentOnline/`, `settlementAgreement/`, `document/`, `eligibility/`, `feePayment/`, `uiPreview/` | Catalogue + fixture claim IDs for `yarn preview`. Extra claims: `uiPreviewRedisData.json` + `compose/ui-preview-mappings/` |

Content builders return objects for Nunjucks (summary rows, task lists). Reuse `services/features/common/` (e.g. support-required lists) instead of copying.

### `translation/`

**Load path:** CCD JSON → CUI models (`convertToCUI/`, plus claim/response/GA/mediation/judgmentOnline/caseProgression folders).

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
