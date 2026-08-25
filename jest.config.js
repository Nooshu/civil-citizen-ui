module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['ts-jest', {tsconfig: 'tsconfig.jest.json'}],
    // App asset scripts may use ESM imports (e.g. postcode-lookup.js).
    '/src/main/assets/js/.+\\.js$': 'babel-jest',
    // ESM-only deps: transform so Jest can load them
    '.*/node_modules/(@exodus/bytes|entities|html-encoding-sniffer|@asamuzakjp/css-color|@asamuzakjp/generational-cache|@asamuzakjp/dom-selector|cssstyle|@csstools|parse5|jsdom|@tootallnate/once|uuid|govuk-frontend)/.+\\.(js|mjs|cjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@exodus/bytes|entities|html-encoding-sniffer|@asamuzakjp/css-color|@asamuzakjp/generational-cache|@asamuzakjp/dom-selector|cssstyle|@csstools|parse5|jsdom|@tootallnate/once|uuid|govuk-frontend)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^otplib$': '<rootDir>/__mocks__/otplib.js',
    '^common/(.*)$': '<rootDir>/src/main/common/$1',
    '^models/(.*)$': '<rootDir>/src/main/common/models/$1',
    '^form/(.*)$': '<rootDir>/src/main/common/form/$1',
    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^services/(.*)$': '<rootDir>/src/main/services/$1',
    '^app/auth/(.*)$': '<rootDir>/src/main/app/auth/$1'
  },
  setupFilesAfterEnv: ['./jest.setup.redis-mock.js', './jest.setup.js'],
  /**
   * Count every application source file, not only those a test already imported.
   * Webpack output and the webpack JS/SCSS entry are excluded so the report
   * measures Civil Citizen UI (CUI) code we maintain.
   */
  collectCoverageFrom: [
    'src/main/**/*.{ts,js}',
    '!src/main/public/**',
    '!src/main/index.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/main/public/',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  /**
   * Global floor from collectCoverageFrom runs (statements ~97.8%, branches
   * ~87.6%, functions ~98.6%, lines ~97.8% as of 25 August 2026). About one
   * percentage point of slack so machine noise does not fail CI, but a new
   * untested controller of a few hundred lines will.
   */
  coverageThreshold: {
    global: {
      statements: 97,
      branches: 86,
      functions: 97,
      lines: 97,
    },
  },
};
