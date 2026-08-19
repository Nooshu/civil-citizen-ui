# `src/main/common/` — forms, models, logging, utils

## `form/`

class-validator models for POST bodies. Prefer existing validators under `form/validators/` over one-off checks in controllers.

- `form/models/` — page models (statement of means, cookies, case progression uploads, …)
- `form/validators/` — shared constraints (`isFileSize`, date validators, “at least one row”, …)
- `form/validationErrors/` — message keys (wire to internationalisation (i18n), do not hard-code English in validators if the pattern already uses keys)

Controllers: parse body → construct form class → validate → service. Keep that pipeline.

`experimentalDecorators` in tsconfig is required for these classes.

## `models/`

Domain + CCD-shaped types. Important roots:

| Folder | Meaning |
| --- | --- |
| `claim.ts`, `civilClaimResponse.ts`, `party.ts` | Core case graph |
| `ccdResponse/`, `ccdGeneralApplication/` | CCD JSON shapes for translators |
| `generalApplication/`, `claimantResponse/`, `caseProgression/`, `directionsQuestionnaire/`, `mediation/`, `queryManagement/`, `judgmentOnline/`, `dashboard/`, `document/`, `eligibility/`, `firstContact/`, `feePayment/` | Journey models |
| `events/`, `gaEvents/` | CCD event names — use these constants when submitting |
| `AppRequest.ts` | Express `Request` with `session.user` |
| `taskList/`, `summaryList/`, `summaryText/` | CYA / task list view models |
| `legacyDraftClaim/` | Old CMC draft shape — do not extend for new work |

When CCD fields move, update **models + translation + tests** together.

## `logging/`

PII redaction (`piiRedaction`) is installed in `server.ts` **before** `app` loads. Do not log PII even if redaction exists — Semgrep (`.semgrep/logging-pii.yml`) still flags source. CCD references / operational ids are OK.

## `mappers/` and `utils/`

Shared formatters (dates, URLs, file upload, monthly income/expense calculators, task-list tasks, CYA helpers). Prefer adding a util here over copying logic between services. `formatDateToFullDate` returns an empty string for missing or invalid dates — never Luxon’s `Invalid DateTime` (claimant-response confirmation panel). Defendant-response document hints use `respondent1ResponseDate` or the DEFENDANT_DEFENCE `createdDatetime`; pass that formatted string into `addCreateFileInformation` **without** wrapping it in `t()` (that interpolation yields `Created []`).

Income/expense calculators also have a **route** under `src/main/routes/calculateMonthlyIncomeExpense/` used by client JS.

## Tests

`src/test/unit/common/` mirrors this tree. Form tests should not import `{app}`.
