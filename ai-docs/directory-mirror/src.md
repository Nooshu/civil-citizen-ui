# `src/`

Three sibling trees. Do not put application runtime code under `src/test` or `src/integration-test`.

```text
src/
├── main/              Express app (ts-node / Docker)
├── test/              Jest unit, CodeceptJS, Pact, Pa11y, e2e doc generators
└── integration-test/  Jest integration (separate config, runInBand)
```

Root `tsconfig.json` **includes only** `src/main/**/*`. Tests use Jest ts-jest configs. Playwright is **outside** `src/` (`playwright/`).

## Invariants

- Path aliases (`common/*`, `services/*`, …) point at `src/main/`. Tests import production code via those aliases or relative `../main/`.
- `src/main/public/` is webpack output and is gitignored — never commit it as source; never edit it by hand.

## Next

- [src-main.md](src-main.md)
- [src-test.md](src-test.md)
- [src-integration-test.md](src-integration-test.md)
