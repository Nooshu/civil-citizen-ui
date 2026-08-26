# Playbook: Ministry of Justice (MoJ) Frontend is not a Civil Citizen UI (CUI) dependency

**Status: done.** Do not treat this as an upgrade-in-progress.

Human handover (why, inventory, journeys, standing rules): [`docs/moj-frontend.md`](../../docs/moj-frontend.md).

Canonical standing rule: [`AGENTS.md`](../../AGENTS.md) — GOV.UK Frontend. Do **not** add `@ministryofjustice/frontend` (any major) or `jquery` / `moment` to restore Add another.

The old filename `moj-frontend-v10-upgrade.md` is a stub. CUI did **not** stay on MoJ v10.

## Facts agents get wrong

| Wrong | Right |
| --- | --- |
| “CUI uses MoJ as a design system” | GOV.UK Frontend only. MoJ was a jQuery **Add another** clone. |
| “Bump `@ministryofjustice/frontend` to v10” | Package **removed**. v10 Sass cannot load beside GOV.UK `@import`. |
| “Restore `jquery` / `mojAll.js` / `webpack/ministryOfJusticeFrontend.js`” | Gone on purpose. |
| “Pin `moment` for MoJ” | Transitive `moment` from `@hmcts/nodejs-logging` is unrelated. |
| Wrap mediation in `.cui-add-another__items` | Mediation add is a **server POST**. Client clone must no-op. |
| Re-add `@ministryofjustice/frontend` | Package **removed**. GOV.UK Frontend is the design system. |

## Implementation (do not invent a second copy)

- JS: [`src/main/assets/js/add-another.js`](../../src/main/assets/js/add-another.js) — `export function initAddAnother(scope = document)`
- Init: [`src/main/index.js`](../../src/main/index.js) calls `initAddAnother()` **after** GOV.UK `initAll()`
- Bind only when `[data-module="cui-add-another"]` contains `.cui-add-another__items`
- CSS: `.cui-add-another*` in `src/main/assets/scss/main.scss`
- Add-button wrapper: `cui-add-another__actions` (DOM hook for `reindex-add-another-actions.js`)
- Case-progression action names: `reindex-add-another-actions.js`
- Court-order max rows: `conditionally-hide-add-button.js`
- Directions questionnaire (DQ) / timeline / expenses / employers: `initAppendRow` in `append-row.js` (`.row-container` / `.append-row`) — **second markup contract**, same `initAddAnother()` call
- Tests: `src/test/unit/assets/js/add-another.test.ts` (clone, remove, mediation no-op), `append-row.test.ts`

## If Add another clone breaks

1. Fix `add-another.js` (needs `.cui-add-another__items` or it no-ops — mediation uploads rely on that).
2. Keep enhancers: `select-toggle.js`, `reindex-add-another-actions.js`, `conditionally-hide-add-button.js`, `remove-error-content.js`.
3. Do not restore the npm package. New repeatable UX = app JS or GOV.UK patterns.

## UI Preview 500s on upload pages (not an Add another bug)

Empty Redis document objects plus `.length` on undefined arrays used to 500. Services optional-chain. `sendRedisCommand` falls back when `ioredis-mock` has no `.call`. `config/e2eTest.yaml` turns `uploadRateLimit` off. Seeds: [`ui-preview-missing-data.md`](ui-preview-missing-data.md).

## Verify

```bash
yarn test src/test/unit/assets/js/add-another.test.ts src/test/unit/assets/js/append-row.test.ts src/test/unit/assets/js/reindex-add-another-actions.test.ts src/test/unit/assets/js/conditionally-hide-add-button.test.ts
yarn build
```

`src/main/public/main-dev.js` must not contain `MOJFrontend` / `jquery`.

UI Preview clicks: evidence, court orders, case-progression uploads (client clone); mediation uploads (**POST**, not clone); one `.append-row` journey (timeline or directions questionnaire). Paths: [`docs/moj-frontend.md`](../../docs/moj-frontend.md).
