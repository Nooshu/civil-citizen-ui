# `infrastructure/` — Terraform

Azure resources for CUI: resource group, Key Vault secrets, Redis (`cnp-module-redis`), Application Insights.

CODEOWNERS: `@hmcts/civil-admins`. Do **not** treat a citizen-UI feature PR as a Terraform change unless the user asked.

| File | Role |
| --- | --- |
| `_main.tf`, `_variables.tf`, `_state.tf` | Core |
| `key-vault.tf`, `key-vault-secrets*.tf` | Secrets (civil, serviceauth, cmc) |
| `redis.tf` | Draft/session Redis |
| `app-insights.tf` | Telemetry |
| `alerts.tf` | Alerts |
| `aat.tfvars`, `ithc.tfvars`, `prod.tfvars` | Env |
| `.terraform-version` | Pin |
| `README.md` | Generated-style provider/module table |

`.terraform/` and lockfiles are gitignored.

App-side secret **consumption** is `src/main/modules/properties-volume/` + Helm env — not these `.tf` files.

If Redis hostname/TLS/key names change in Terraform, config env maps and Helm values must follow; call out TTL/key design in the summary.
