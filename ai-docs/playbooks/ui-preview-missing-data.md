# Playbook: empty or broken UI Preview pages

Use when `yarn preview` returns **Hypertext Transfer Protocol (HTTP) 200** but the screen looks unfinished: empty tables, `£NaN`, Luxon `Invalid DateTime`, `Created []`, leaked i18n keys (`PAGES.…undefined`), or a blank interpolated heading.

Canonical short rule: [`AGENTS.md`](../../AGENTS.md) — UI Preview (missing data).

## HTTP 200 is not a useful page

The catalogue GET only proves a template rendered. Walk every `{{ }}` / `t()` interpolation and every service field the controller passes. If a citizen would see a blank, a `NaN`, or a raw key, the page is not Ready until you **seed fixture data** or add a **production-safe fallback** (empty string, omit the query param, fallback caption). Do not hard-code sample citizen copy in Nunjucks to fill preview.

## Two stores — seed both when the journey reads both

| Store | Path | Who reads it |
| --- | --- | --- |
| WireMock case | `compose/ui-preview-mappings/*.json` → `GET /cases/:id` | `civilServiceClient.retrieveClaimDetails` (dashboard, query management view-query, many GETs) |
| Redis draft | `src/main/modules/e2eConfiguration/uiPreviewRedisData.json` key `{claimId}someID` | `getClaimById` / draft store (claimant-response, some GA drafts) |
| GA Redis | `gaRedisData.json` | General application (GA) draft by app id (`1732194111758649someID`) |

A field only on Redis will not appear on a page that loads the case from WireMock, and the reverse. Keep Core Case Data (CCD) shapes aligned.

**Reload:** bind-mounted mapping JSON → `docker compose -f compose/ui-preview.yml restart wiremock`. Redis JSON, TypeScript, or Nunjucks → rebuild `citizen-ui`. Do not copy preview stubs into `charts/civil-citizen-ui/wiremock/`.

Fixture user is **`someID`**. Query-management `createdBy` must be `someID` (optionally `someID::CLAIMANT`) or the table will not say **You**.

## Fix in the right layer

| Kind of gap | Do this |
| --- | --- |
| List or table with no rows | Seed the CCD collection the service already maps (`queries.caseMessages`, documents, …) |
| Catalogue GET omits a query string the live journey sends | Production fallback from draft/CCD (e.g. fee pence → pounds). Do not require `?appFee=` for a useful confirmation |
| `Number(req.query.x)` when `x` is absent | Treat non-finite as missing; never interpolate `NaN` into copy or URLs |
| Dynamic i18n suffix (`RESPOND_TO.${type}`) | Map CCD **display labels** and enum keys; fallback string when type is missing — never `t('…undefined')` |
| Date in a hint or panel | `formatDateToFullDate` must return `''` for missing/invalid (not `Invalid DateTime`). Convert CCD ISO strings with `new Date(...)`. Pass **already formatted** dates into macros — wrapping them in `t()` yields `Created []` |
| Amount on the wrong admission type | Use a helper that matches the claim (`amountDefendantAdmittedInPounds` uses `totalClaimAmount` on full admit). Do not format `undefined` with a currency filter |
| CCD field is a label, not an enum | Example: GA `applicationTypes` is **Strike out**, not `STRIKE_OUT`. Translators must accept both |

## Symptom → usual cause (this fork)

| What you see | Usual miss |
| --- | --- |
| **Messages to the court** table headers only | `claim.queries.caseMessages` empty on WireMock `1645882162449603`. Seed parent threads (`createdBy: someID`). Even-length thread + court reply → **Response received**; odd → **Message sent**; `isClosed: Yes` on latest even thread → **Closed** |
| Query details 500 | Parent `id` in the URL is not a parent message id on that case |
| **Created []** / empty document hint | Date missing, invalid, still a string the formatter rejected, or the formatted value was passed through `t()` |
| **Created [25 September 2022]** | Intended product copy (square brackets). Empty brackets are the bug |
| Luxon **Invalid DateTime** | Missing `paymentDate` / `applicant1ResponseDate` / similar; or formatter used to stringify invalid DateTime |
| **£NaN** (settle admitted) | Full admission used part-admit amount helper |
| **£NaN** (GA / COSC confirmation) | Catalogue GET has no `?appFee=`; draft `applicationFee.calculatedAmountInPence` not read (`10800` → £108) |
| `PAGES.…undefined` overflowing Contact us | Caption interpolated a missing application type; layout `pageTitle` used `claimId` as `undefined` |
| **APPLICATION_TYPE_CCD.undefined** | WireMock stored enum key; UI expects CCD label |
| **Your payment plan** length is a dash | Empty `suggestedPaymentIntention.repaymentPlan` (`{}`). Need `paymentAmount`, `repaymentFrequency`, `firstRepaymentDate`. Client script must run on `document.readyState === 'complete'`, not only `window` `load` |
| **Court offered set date** blank / Invalid DateTime | No `paymentIntention.paymentDate` on full/part admission |
| Statement-of-means guard redirect | Wrong claim: need `1645882162449605` (part admit, non-immediate pay) |
| Trial-arrangement guard redirect | `1645882162449603` must be `FAST_CLAIM` |
| **Why do you disagree** / interest total fails | Missing `POST /fees/claim/calculate-interest` in `ui-preview-shared-apis.json` |

Fixture claim ids: [`AGENTS.md`](../../AGENTS.md) Runtime. Catalogue: `src/main/services/features/uiPreview/pageCatalog.ts`. Human story: [`KEYCHANGES.md`](../../KEYCHANGES.md) “Preview screens that used to look broken”.

## Before marking a catalogue GET Ready

1. Open the live URL as a user (or curl the HTML). Confirm rows, amounts, and dates — not only status 200.
2. Seed WireMock and Redis for every field the template needs.
3. Add production-safe empty/invalid handling if the same gap can happen on a real case.
4. Restart WireMock or rebuild CUI as above.
5. Update this playbook, `AGENTS.md` Runtime, and the matching `directory-mirror/` page in the same change.
