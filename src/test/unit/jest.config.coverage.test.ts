/**
 * Guards the honest-coverage settings in jest.config.js.
 *
 * @remarks A missing collectCoverageFrom allowlist silently reports only files
 *   the suite already imported. A missing coverageThreshold lets that number
 *   fall without failing yarn test:coverage.
 */
describe('jest coverage configuration', () => {
  const config = require('../../../jest.config.js') as {
    collectCoverageFrom?: string[];
    coverageThreshold?: {global?: {statements?: number; branches?: number; functions?: number; lines?: number}};
  };

  it('collects coverage from application TypeScript and JavaScript', () => {
    expect(config.collectCoverageFrom).toEqual(expect.arrayContaining([
      'src/main/**/*.{ts,js}',
      '!src/main/public/**',
      '!src/main/index.js',
    ]));
  });

  it('enforces a global coverage floor', () => {
    expect(config.coverageThreshold?.global).toEqual({
      statements: 97,
      branches: 86,
      functions: 97,
      lines: 97,
    });
  });

  it('nests CommonJS glob under @jest/reporters so CoverageReporter can read thresholds', () => {
    const pkg = require('../../../package.json') as {
      dependencies?: Record<string, string>;
      resolutions?: Record<string, string>;
    };
    expect(pkg.dependencies?.glob).toBeUndefined();
    expect(pkg.resolutions?.glob).toBeUndefined();
    expect(pkg.resolutions?.['@jest/reporters/glob']).toBe('7.2.3');
  });
});
