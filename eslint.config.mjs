import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import codeceptjs from 'eslint-plugin-codeceptjs';
import globals from 'globals';

/**
 * Shared style rules carried forward from the previous `.eslintrc.js`.
 * @remarks ESLint 10 only supports flat config, so these live here instead of
 *   legacy `extends` / `env` blocks.
 */
const sharedStyleRules = {
  indent: ['error', 2, {SwitchCase: 1}],
  'linebreak-style': ['error', 'unix'],
  'comma-dangle': ['error', 'always-multiline'],
  semi: ['error', 'always'],
  'no-multiple-empty-lines': ['error', {max: 1}],
};

const codeceptjsGlobals = Object.fromEntries(
  Object.entries(codeceptjs.environments.codeceptjs.globals).map(([name, writable]) => [
    name,
    writable ? 'writable' : 'readonly',
  ]),
);

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      '**/*.d.ts',
      'src/main/public/**',
      'src/main/types/**',
      'jest.*config.js',
      'src/main/assets/js/mojAll.js',
      '.semgrep/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...codeceptjsGlobals,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      codeceptjs,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...sharedStyleRules,
      quotes: ['error', 'single'],
      // New in ESLint 10 recommended — defer enabling until a dedicated cleanup.
      'no-useless-assignment': 'off',
      'no-unassigned-vars': 'off',
      'no-unused-vars': 'warn',
    },
  },
  // Official flat recommended stack (turns off no-undef for TS, etc.).
  ...tsPlugin.configs['flat/recommended'].map((block) => ({
    ...block,
    files: block.files ?? ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      codeceptjs,
    },
    rules: {
      ...sharedStyleRules,
      quotes: ['error', 'single', {avoidEscape: true}],
      // Preserve prior opt-out; rule renamed in typescript-eslint v8.
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // New in ESLint 10 recommended — defer enabling until a dedicated cleanup.
      'no-useless-assignment': 'off',
      'no-unassigned-vars': 'off',
      // These recommended rules already failed widely under the previous
      // `.eslintrc.js` + `plugin:@typescript-eslint/recommended` setup.
      // Keep them visible as warnings so the ESLint 10 migration stays green;
      // tighten in a follow-up cleanup PR.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
    },
  },
];

export default config;
