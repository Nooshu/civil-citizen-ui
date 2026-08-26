# Ministry of Justice (MoJ) Frontend — status for a future team

**Status: done.** `@ministryofjustice/frontend` and `jquery` are **not** dependencies. Do **not** re-add them.

This page is the human handover. The agent playbook is [`../ai-docs/playbooks/moj-frontend.md`](../ai-docs/playbooks/moj-frontend.md). Older filenames (`moj-frontend-v10-migration.md`, `moj-frontend-v10-upgrade.md`) are stubs so existing links still work.

## What a future team must know in one minute

1. **Civil Citizen UI (CUI) never used MoJ Frontend as a design system.** GOV.UK Frontend is the only design system. MoJ was a **jQuery plugin** that cloned repeatable form rows (“Add another”).
2. **That plugin is gone.** Repeatable rows that used to call MoJ now use **`src/main/assets/js/add-another.js`** (`initAddAnother`), called from `src/main/index.js` after GOV.UK `initAll()`. Markup uses **`data-module="cui-add-another"`** and **`.cui-add-another*`** classes — not `moj-add-another*`. `initAddAnother` also starts **`initAppendRow`** for the older `.append-row` / `.row-container` contract.
3. **Do not wrap mediation uploads in `.cui-add-another__items`.** Mediation “Add another” is a **server POST** (`name="action"`). The client clone **must no-op** there. `initAddAnother` already no-ops unless `__items` exists.
4. **Do not pin `moment`** to “restore” MoJ. Transitive `moment` from `@hmcts/nodejs-logging` is unrelated.
5. **Do not bump MoJ to v10 beside GOV.UK `@import`.** A spike on `10.0.1` failed at Sass compile (`This module was already loaded…`). Removal was cheaper than a dual-pipeline Sass split.

## Why this was done

- MoJ on this app was **years behind**, pulled **jQuery** and **`moment`**, and the only consumer was Add another.
- A v10 spike (`10.0.1`, 13 August 2026) compiled **only if MoJ Sass was omitted**. Official `initAll()` then booted **DatePicker** (unused) and grew the bundle (~227 KiB → ~254 KiB in `main-dev.js`).
- Keeping a second design-system package also fights [service assessment](service-assessment.md) (Service Standard 13 / Technology Code of Practice (TCoP) 4): GOV.UK is the single source of truth.

## What was done (inventory)

| Change | Detail |
|--------|--------|
| Removed packages | `@ministryofjustice/frontend`, `jquery` |
| Removed files | `src/main/assets/js/mojAll.js`, `webpack/ministryOfJusticeFrontend.js` |
| Nunjucks | Search paths in `src/main/modules/nunjucks/index.ts` are **app `views/` + GOV.UK Frontend `dist` only** — no MoJ views |
| Added | `src/main/assets/js/add-another.js` — vanilla clone of the v3 Add another behaviour CUI actually used (not a vendor fork of v10) |
| Init | `src/main/index.js` calls `initAddAnother()` after `initAll()`. That function also starts `initAppendRow` (no separate `append-row.js` import in the entry). |
| CSS | `.cui-add-another*` in `src/main/assets/scss/main.scss` (not `@use` of MoJ Sass) |
| Class rename | `moj-add-another*` → `cui-add-another*`; leftover `moj-button-action` wrappers → `cui-add-another__actions` |
| Tests | `src/test/unit/assets/js/add-another.test.ts` (clone, remove, mediation no-op) and `append-row.test.ts`; `mojAll.test.ts` deleted |
| UI Preview | Evidence, court orders, case-progression witness upload, mediation POST — verified in the browser |

### Journeys

| Journey | Client clone? | How |
|---------|---------------|-----|
| Claim / response evidence | Yes | `add-another.js` when `.cui-add-another__items` is present |
| Court orders | Yes | Same |
| Case-progression uploads | Yes | Same, plus `reindex-add-another-actions.js` for `action[add\|remove][…]` names |
| Mediation uploads | **No** | Wrapper `data-module="cui-add-another"` **without** `__items`; add is a form POST |
| Directions questionnaire support-required / expert report details, timeline, expenses, employers | Yes | `initAppendRow` (`.row-container` / `.append-row`), started from `initAddAnother`. Some templates also use `cui-add-another*` **classes** for heading/item styling; clone behaviour is still the `[n]` / checkbox-conditional contract, not `%index%` placeholders |

### UI Preview 500s fixed while finishing this work

Empty Redis `claimantDocuments` / similar objects used to throw when services called `.length` on **undefined** arrays. Optional chaining was added in case-progression (`witnessService`, `expertService`, `trialService`, `disclosureService`) and mediation (`yourStatementService`, `documentsForDocumentsReferredService`).

Upload **rate limiting** used Redis `CALL` via `.call()`, which **`ioredis-mock` does not implement**. `sendRedisCommand` in `src/main/routes/guards/uploadRateLimitGuard.ts` now falls back to command-named methods. `config/e2eTest.yaml` sets `uploadRateLimit.enabled: false` because UI Preview Compose uses `NODE_ENV: e2eTest`.

Seeds: `claimantUploadDocuments.witness[0].selected` on claim `1645882162449603` in `src/main/modules/e2eConfiguration/uiPreviewRedisData.json`; mediation `typeOfDocuments` with `YOUR_STATEMENT` on `1645882162449409` in `redisData.json`. Playbook: [`../ai-docs/playbooks/ui-preview-missing-data.md`](../ai-docs/playbooks/ui-preview-missing-data.md).

## What a future team must do (standing rules)

If you **touch repeatable rows**:

- Keep **`initAddAnother` no-op without `.cui-add-another__items`**. Never add that class to mediation.
- Prefer **GOV.UK macros** for fields inside a row. Do not invent a second component kit.
- After markup changes, run the matching Jest files **and** click Add / Remove on UI Preview for that journey.
- If you add a **new** repeatable list, copy the **evidence / court-order** pattern (macro-rendered first row + `__items`) or an explicit **server POST** pattern — or the existing `.append-row` / `.row-container` contract if the journey already uses `[n]` indexes and checkbox/radio conditionals. Do **not** reach for MoJ or another npm design-system package.

If you **bump GOV.UK Frontend**:

- There is **no** MoJ Sass/`initAll` follow-up. See [`govuk-frontend-upgrade.md`](../ai-docs/playbooks/govuk-frontend-upgrade.md).

If you **see a PR that adds `@ministryofjustice/frontend` or `jquery`**:

- Reject it unless there is a written exception in this file **and** `AGENTS.md`. The v10 Sass conflict and unused DatePicker still apply.

## What is left

The MoJ removal is complete. New repeatable lists still use **app JS or GOV.UK patterns** — not a new npm design-system package.

## How to verify (regression)

1. `yarn test src/test/unit/assets/js/add-another.test.ts src/test/unit/assets/js/append-row.test.ts src/test/unit/assets/js/reindex-add-another-actions.test.ts src/test/unit/assets/js/conditionally-hide-add-button.test.ts`
2. `yarn build` — `src/main/public/main-dev.js` must **not** contain `MOJFrontend` / `jquery`.
3. UI Preview (`yarn preview`, catalogue **http://localhost:3001/ui-preview**):
   - Claim evidence `/claim/evidence` (fixture `1645882162449409`) — Add another clones a row (URL unchanged).
   - Court orders `/case/1645882162449605/response/statement-of-means/court-orders` — same.
   - Case progression `/case/1645882162449603/case-progression/upload-documents` — Add another clones a witness row.
   - Mediation `/case/1645882162449409/mediation/upload-documents` — Add another **POSTs**; name fields increase; URL stays on the same path.
   - Directions questionnaire or timeline (`.append-row`) — Add another clones a `.row-container` row.

## Historical names (grep)

Old markup used `data-module="moj-add-another"` and classes `moj-add-another`, `moj-add-another__item`, `moj-add-another__add-button`, `moj-add-another__remove-button`, plus the leftover wrapper **`moj-button-action`**. Those strings should **not** appear in `src/`. The Add-button wrapper is **`cui-add-another__actions`**. If `moj-add-another*` or `moj-button-action` reappears, treat it as a regression.

The npm package was **`@ministryofjustice/frontend`**. Do not re-add it.

## Related reading

- [`frontend.md`](frontend.md) — GOV.UK is the single source of truth
- [`FRONTEND-RECOMMENDATIONS.md`](../FRONTEND-RECOMMENDATIONS.md) — §5
- [`dependency-update-log-2026-08-21.md`](dependency-update-log-2026-08-21.md) — v10 spike notes
- [`webpack.md`](../ai-docs/directory-mirror/webpack.md) — `ministryOfJusticeFrontend.js` removed
