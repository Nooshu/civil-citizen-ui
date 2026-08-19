# `src/main/views/` — Nunjucks

GOV.UK Frontend macros are mandatory for Design System components. Conventions: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend (macros, partials, axe).

Human guide: [`docs/frontend.md`](../../docs/frontend.md).

## Layout chrome (do not reimplement)

| File | Role |
| --- | --- |
| `govukTemplate.njk` | GOV.UK page shell |
| `layout.njk` | App layout: header, footer, phase banner, language — **macros**, not hand-rolled header/footer |
| `macro/header.njk` | Logo-only `govukHeader` + `govukServiceNavigation` (Design System pattern). Do not hand-write `govuk-header`. |
| `service-unavailable.njk` + `service-unavailable-layout.njk` | LaunchDarkly shutter |
| `error.njk`, `not-found.njk`, `unauthorised.njk` | Error states |
| `home.njk` | Home |
| `claim-details-tpl.njk`, `claim-details-tpl-dashboard.njk` | Shared claim-detail chrome — **include these**, do not copy |
| `template.njk`, `external-urls.njk` | Shared includes |

New pages: `{% extends "layout.njk" %}` (or the layout neighbours use). Import macros with `{% from "govuk/components/.../macro.njk" import ... %}`.

## `macro/` — app macros (reuse)

Shared fragments: CSRF (`csrf.njk`), error summary wrappers, address/postcode (`postcode-address-form.njk` — keep `.postcode-container` / `.postcode-val` / hidden `.govuk-error-message` for `postcode-lookup.js`), uploaded files (`uploaded-files-summary.njk`), query message cards (`query-message-card.njk`), `task-list.njk` (`govukTaskList`; extra class `app-task-list__item` for Codecept locators), cookie banner, contact-us (`govukDetails`, including `open: true`), statement of truth, timeline rows, GA macros under `macro/generalApplication/`, etc. `yesNoGenericForm.njk` already emits `govukRadios` with a fieldset — pass a **string** `title` plus `isPageHeading` / `legendClasses`; do not wrap it again and do not pass nested HTML as `title`.

If the same block appears on two pages, **extract** here or under `features/common/`.

The claimant-response settle-admitted heading uses `Claim.amountDefendantAdmittedInPounds()` (full defence already-paid in pence, part admission `howMuchDoYouOwe`, otherwise `totalClaimAmount`). Do not format `partialAdmissionPaymentAmount()` alone on a full-admission claim — that is `undefined` and becomes `£NaN`. Court-offered set date uses `getPaymentDate(claim)` (`paymentIntention.paymentDate`); preview admit seeds include that date so the page is not `Invalid DateTime`. GA respondent-agreement must set `{% block pageTitle %}` (the dashboard layout otherwise interpolates `claimId` as `undefined`). Caption text comes from `getRespondToApplicationCaption` — never `RESPOND_TO.${undefined}`. Document tables pass **already formatted** `item.uploadDate` into `addCreateFileInformation` — do not wrap that date in `t()` (`Created []`).

Typography/layout utilities (`govuk-heading-*`, `govuk-grid-*`, `govuk-!-*-*`) are OK. Component **structure** is not — use `govukTable`, `govukInsetText`, `govukButton`, `govukHeader`, `govukTabs`, `govukSummaryList`, `govukTag`, `govukInput`, `govukRadios`, `govukTaskList`, `govukErrorMessage`, `govukDetails`, `govukDateInput`.

`govuk-grid-column-*` only belongs **inside** a `govuk-grid-row`. Columns have 15px gutters that only cancel against the row’s negative margin. Nested columns (for example `two-thirds` wrapping `one-third` on `macro/employer.njk` / `who-employs-you.njk`) indent inputs relative to the heading. Repeating rows keep `.row-container` for `append-row.js`; width comes from one page-level `govuk-grid-column-two-thirds`.

## `features/`

Mirror journey names. Views folder for preview is `ui-preview` (hyphen) vs routes `uiPreview`.

`features/common/` — shared journey pages (e.g. yes/no).

## `webpack/`

Nunjucks snippets that inject hashed `main` / CSS tags (`js.njk`, `css.njk`, templates). Do not hard-code `/main-dev.js` in layouts; use these includes.

## Client JS contract

Pages that need postcode lookup, add-another rows, or calculators must render the **macro HTML those scripts already bind to**. Do not invent parallel IDs. Scripts are listed in [src-main-assets.md](src-main-assets.md).

## i18n in templates

Use `t('PAGES…')` / existing `t()` helpers. Add `en.json` and `cy.json` keys in the same change.

## CSRF

POST forms must include the CSRF token (see `macro/csrf.njk`). Eligibility/first-contact are skipped at middleware — do not copy that skip elsewhere.

## Tests

There is no full visual snapshot suite. GOV.UK **component** HTML: `yarn test:govuk-fixtures`. Route tests assert status and sometimes HTML strings. Pa11y: `yarn tests:a11y`. After GOV.UK upgrades follow `AGENTS.md` GOV.UK Frontend (upgrade checklist).
