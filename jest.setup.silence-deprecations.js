/**
 * Silence Node DEP0060 (`util._extend`) during Jest runs.
 *
 * Source: winston@2 `Container.get` uses `require('util')._extend`, called from
 * `@hmcts/nodejs-logging` `Logger.getLogger`. Winston 2 is still pinned by that
 * package; Object.assign migration is upstream.
 *
 * Load this as early as possible (`require` from jest*.config.js and via
 * `node --disable-warning=DEP0060` in package.json test scripts). Jest
 * `setupFiles` alone is too late — the first `_extend` often runs during
 * worker/bootstrap before setupFiles.
 */
const originalEmitWarning = process.emitWarning.bind(process);

process.emitWarning = (warning, ...args) => {
  const options = typeof args[0] === 'object' && args[0] !== null ? args[0] : undefined;
  const code = options?.code ?? args[1] ?? (typeof warning === 'object' && warning !== null ? warning.code : undefined);

  if (code === 'DEP0060') {
    return;
  }

  return originalEmitWarning(warning, ...args);
};
