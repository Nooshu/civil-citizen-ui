# `src/integration-test/` — Jest route integration

**Not** CodeceptJS. Command: `yarn test:integration` (alias `yarn test:routes`). Config: `jest.functionaltest.config.js`, `--runInBand`.

```text
src/integration-test/
├── setup/testSetup.ts
├── modules/draft-store/
├── routes/          # claimantResponse, dashboard, eligibility, generalApplication, payment, queryManagement, response
└── services/        # e.g. generalApplication
```

Uses the same path aliases and ioredis-mock as unit tests, plus `testSetup.ts`.

## When to run

After changing middleware order in `app.ts`, CSRF/OIDC allowlists, session, or route registration that unit tests might miss.

JUnit output: `functional-output/test-output.html` (directory name is historical).

`tsconfig.jest.integration.json` extends the app tsconfig with `isolatedModules` and `rootDir: "."`.
