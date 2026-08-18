# Contributing

## Remotes and branches

- Default branch: `master`
- Upstream: `hmcts` → `git@github.com:hmcts/civil-citizen-ui.git`  
  Add if missing: `git remote add hmcts git@github.com:hmcts/civil-citizen-ui.git`
- Fork: `origin`

Before changing application code, sync upstream (`AGENTS.md` — Before changing code):

```bash
git fetch hmcts
git pull --rebase hmcts master
```

If the working tree is dirty, stash, commit, or branch first.

Package-only version bumps that pass tests may be rebased onto `origin/master` and pushed there; that workflow is for maintainers following the dependency-pinning rule, not for feature PRs.

## Code style

- **TypeScript** throughout server code. Avoid `any` and `@ts-ignore` unless documented.
- **ESLint 10** flat config: `eslint.config.mjs` (Windows: `eslint.config.win.mjs`).
- **stylelint** on SCSS.
- Prefer existing Express patterns: [`AGENTS.md`](../AGENTS.md) — Server / application stack.
- Form validation: class-validator models under `src/main/common/form/`.
- Comments: TSDoc-compatible `/** */`, no `{Type}` braces on `@param` in `.ts` files (`AGENTS.md` — Documentation and code comments).

## UI rules (non-negotiable)

1. GOV.UK Frontend macros for components.
2. App JS only in `src/main/assets/js/` — never vendor forks.
3. App theme only in `src/main/assets/scss/`.
4. Reuse Nunjucks partials; do not duplicate claim-summary chrome.
5. axe does not override GOV.UK.

## Dependencies

- Yarn 4; exact pins for packages you touch.
- Patch/minor preferred; 7-day publish cooldown for routine bumps.
- After dependency PRs: `yarn test:coverage`. On SIGSEGV, re-run the one suite.
- Do not invent a second HTTP client or database.

## Git hygiene

- Conventional messages without a ticket prefix unless the user supplied a real key.
- **Never invent JIRA ids** (`DTSCCI-####`, `CIV-####`, …).
- Do not add `Co-Authored-By` trailers naming an AI agent or product.
- Do not commit unless asked, if you are an automation/agent — humans commit as usual.

## Documentation you must keep in sync

If you change runtime versions, scripts, remotes, GOV.UK version, Redis TTLs, or WireMock ownership, update:

- this `docs/` tree
- [README.md](../README.md) getting-started bits if commands changed
- [AGENTS.md](../AGENTS.md) if a standing agent convention changed
- [`ai-docs/`](../ai-docs/README.md) if directories, scripts, or invariants changed (or confirm it is unaffected)
- specialised docs (WireMock, PII, functional diagnostics) when those topics changed

## Review checklist (human PRs)

- [ ] Upstream `hmcts/master` merged or rebased
- [ ] `yarn lint` clean
- [ ] Unit tests for new branches; integration tests if middleware/routes changed
- [ ] Nunjucks uses macros; no duplicated journey HTML
- [ ] No PII in new `logger.*` calls
- [ ] Config/env documented if you added keys
- [ ] Chart WireMock still validates if you touched mappings
- [ ] README generated tables left alone unless you intended to regenerate them

## Agent-oriented rules

AI assistants should treat [AGENTS.md](../AGENTS.md) as canonical (it is not tied to a particular IDE). Directory-level context, playbooks, and script catalogues live in [ai-docs/](../ai-docs/README.md). This contributing guide is for humans and agents alike; if `AGENTS.md` and this page ever diverge, **`AGENTS.md` wins** — then fix this page in the same change.
