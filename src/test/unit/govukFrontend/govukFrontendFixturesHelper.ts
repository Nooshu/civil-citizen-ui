import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';

/**
 * Paths and helpers for comparing GOV.UK Frontend Nunjucks macros to shipped fixtures.json.
 * @see https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files
 */

export const GOVUK_FRONTEND_DIST = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'node_modules',
  'govuk-frontend',
  'dist',
);

export const GOVUK_COMPONENTS_DIR = path.join(GOVUK_FRONTEND_DIST, 'govuk', 'components');

export type GovukFixture = {
  name: string;
  options: Record<string, unknown>;
  html: string;
  hidden?: boolean;
};

export type GovukFixturesFile = {
  component: string;
  fixtures: GovukFixture[];
};

/**
 * Converts a GOV.UK component folder name to its Nunjucks macro export name.
 * @param componentFolder - e.g. `back-link`
 * @returns e.g. `govukBackLink`
 */
export const toGovukMacroName = (componentFolder: string): string =>
  'govuk' +
  componentFolder
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * Normalises insignificant whitespace so fixture HTML can be compared across renderers.
 * @remarks GOV.UK documents that frameworks may add extra whitespace; compare structure, not formatting.
 * @param html - Raw HTML from a fixture or Nunjucks render
 */
export const normalizeGovukHtml = (html: string): string =>
  html
    .replace(/\r\n/g, '\n')
    .replace(/\s+>/g, '>')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Lists component folders that ship a fixtures.json file in the installed govuk-frontend package.
 */
export const listGovukComponentsWithFixtures = (): string[] =>
  fs
    .readdirSync(GOVUK_COMPONENTS_DIR)
    .filter((name) => fs.existsSync(path.join(GOVUK_COMPONENTS_DIR, name, 'fixtures.json')))
    .sort();

/**
 * Loads fixtures.json for a component folder.
 * @param componentFolder - Component directory name under govuk/components
 */
export const loadGovukFixtures = (componentFolder: string): GovukFixturesFile => {
  const fixturesPath = path.join(GOVUK_COMPONENTS_DIR, componentFolder, 'fixtures.json');
  return JSON.parse(fs.readFileSync(fixturesPath, 'utf8')) as GovukFixturesFile;
};

/**
 * Creates a Nunjucks environment that can resolve official GOV.UK Frontend macros
 * the same way the CUI app does (`govuk-frontend/dist` on the search path).
 */
export const createGovukNunjucksEnvironment = (): nunjucks.Environment =>
  nunjucks.configure([GOVUK_FRONTEND_DIST], {
    autoescape: true,
  });

/**
 * Renders one fixture through the official Nunjucks macro for that component.
 * @param env - Nunjucks environment with GOV.UK Frontend on the path
 * @param componentFolder - Component directory name
 * @param options - Fixture `options` object passed to the macro
 */
export const renderGovukFixture = (
  env: nunjucks.Environment,
  componentFolder: string,
  options: Record<string, unknown>,
): string => {
  const macroName = toGovukMacroName(componentFolder);
  const importPath = `govuk/components/${componentFolder}/macro.njk`;
  return env.renderString(
    `{% from "${importPath}" import ${macroName} %}{{ ${macroName}(options) }}`,
    {options},
  );
};
