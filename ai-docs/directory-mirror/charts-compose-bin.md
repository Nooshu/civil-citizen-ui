# `charts/`, `compose/`, `bin/`

## charts

Path: `charts/civil-citizen-ui/`.

| File | Role |
| --- | --- |
| `Chart.yaml` | Product `civil`, component `citizen-ui`. Deps: `nodejs` (always), optional `wiremock`, `civil-service`, `servicebus`, `wa` |
| `values.yaml` | Base |
| `values.preview.template.yaml` | Default PR preview (mocked-leaning) |
| `values.fullDeployment.preview.template.yaml` | Label `pr-values:fullDeployment` |
| `values.reducedStack.preview.template.yaml` | Label `pr-values:reducedStack` — CUI + WireMock only |
| `values.aat.template.yaml` | AAT |
| `templates/wiremock-mappings-configmap.yaml` | Packs chart WireMock into the release |
| `wiremock/mappings/` + `wiremock/__files/` | **Consumer-owned reduced-stack contracts** (create-claim subset + health) |

CODEOWNERS: `charts/` admins; `templates/`, `wiremock/`, `*.template.yaml` also `@hmcts/civil`.

### WireMock ownership (critical)

| Set | Path | Allowed matchers |
| --- | --- | --- |
| Reduced-stack | `charts/civil-citizen-ui/wiremock/` | Strict — `yarn wiremock:validate` **forbids broad matchers** |
| UI Preview | `compose/ui-preview-mappings/` | Broader OK for browsing |

Never copy preview stubs into the chart. Docs: [`docs/reduced-stack-wiremock-contracts.md`](../../docs/reduced-stack-wiremock-contracts.md).

Preview labels (do not combine reducedStack + fullDeployment): see [`docs/ci-cd-and-deployment.md`](../../docs/ci-cd-and-deployment.md).

`Chart.lock` and nested `charts/civil-citizen-ui/charts*` are gitignored.

## compose

| File | Command |
| --- | --- |
| `draft-store.yml` | `yarn start:redis` — Redis `6379` |
| `ui-preview.yml` | `yarn preview` — CUI + WireMock |
| `ui-preview-mappings/` | Preview-only stubs; chart mappings may be mounted nested as `reduced-stack/` |

Preview URL: **http://localhost:3001/ui-preview** (HTTP). Fixture user `someID`. Empty tables, `£NaN`, `Invalid DateTime`, or `Created []` are missing CCD/Redis fields — [playbooks/ui-preview-missing-data.md](../playbooks/ui-preview-missing-data.md). Fixture claims: `1645882162449409` (awaiting defendant), `1645882162449601` (full admit by instalments), `1645882162449602` (part admit by instalments), `1645882162449603` (case progression, FAST_CLAIM, trial arrangements, hearing duration, `respondent1ResponseDate` and a DEFENDANT_DEFENCE PDF so **View the response to the claim** is not `Invalid DateTime`, plus ten sample `queries.caseMessages` parent threads so **Messages to the court** is populated), `1645882162449604` (general application with a strike-out draft; GA `applicationTypes` is the CCD label **Strike out**, not `STRIKE_OUT`), `1645882162449605` (defendant part admit + statement of means). Redis extras: `src/main/modules/e2eConfiguration/uiPreviewRedisData.json`. Mappings: `compose/ui-preview-mappings/` (`ui-preview-claims.json` plus journey files, including `ui-preview-som.json` and `ui-preview-shared-apis.json` for court locations, Ordnance Survey postcode lookup, airlines, fee ranges, claim interest, response deadline, and general-application fees).

## bin

Full script list: [`scripts-and-commands.md`](../scripts-and-commands.md).

### Owned vs pulled

- **Owned:** `ui-preview.sh`, WireMock validate/test, mocked-functional runner, SSL generator, import wrappers, `variables/*.sh`, `check-dependency-pins.mjs`, `check-yarn-audit.mjs`
- **Pulled (do not patch):** `bin/shared/*` from civil-service via `pull-latest-civil-shared.sh` (`postinstall` with `|| true`)
- **Pulled WireMock (root):** `wiremock/` from `pull-latest-wiremock-mappings.sh` — gitignored; **not** the chart folder

CCD/Camunda imports in preview pipelines use these scripts plus GitHub labels `civilDefinitionBranch:`, `civilServicePr:`, `civilShared:`.
