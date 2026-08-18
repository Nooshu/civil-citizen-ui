# `playwright/` — API security specs

Not part of `yarn test`. Root `tsconfig.json` **excludes** this folder. Editor/typecheck: `playwright/tsconfig.json` (`noEmit`, `types: ["node"]` only so `@playwright/test` does not clash with Jest globals).

```text
playwright/
├── helpers/
├── tests/api-security/
│   ├── cors-policy.spec.ts
│   ├── error-handling.spec.ts
│   ├── express5-regression.spec.ts
│   ├── header-injection.spec.ts
│   ├── health-endpoints.spec.ts
│   ├── payment-session-*.spec.ts   # expired token, isolation, IDOR, specific
│   ├── security-headers.spec.ts
│   ├── sql-injection.spec.ts
│   └── xss-injection.spec.ts
└── tsconfig.json
```

Needs a **running** CUI. Preview runner: `bin/run-preview-playwright-tests.sh`.

These tests encode security properties (headers, payment-session isolation). If you change payment Redis keys, OIDC payment return paths, Helmet, or Express error pages, consider extending the matching spec.

Do not import these files from Jest. Do not add `jest` types to `playwright/tsconfig.json`.
