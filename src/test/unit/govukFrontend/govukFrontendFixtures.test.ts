/**
 * Asserts every GOV.UK Frontend component fixture renders identical HTML via official Nunjucks macros.
 *
 * @see https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files
 * @remarks
 * Hidden fixtures are included: they still define expected HTML even when skipped for visual tests.
 * Whitespace is normalised per GOV.UK guidance (frameworks may differ on insignificant whitespace).
 */
import {
  createGovukNunjucksEnvironment,
  listGovukComponentsWithFixtures,
  loadGovukFixtures,
  normalizeGovukHtml,
  renderGovukFixture,
  toGovukMacroName,
} from '../../utils/govukFrontendFixturesHelper';


describe('GOV.UK Frontend fixtures (macro HTML accuracy)', () => {
  const env = createGovukNunjucksEnvironment();
  const components = listGovukComponentsWithFixtures();

  it('discovers component fixtures from the installed govuk-frontend package', () => {
    expect(components.length).toBeGreaterThan(0);
  });

  describe.each(components)('component: %s', (componentFolder) => {
    const {fixtures} = loadGovukFixtures(componentFolder);
    const macroName = toGovukMacroName(componentFolder);

    it(`exposes macro ${macroName} and at least one fixture`, () => {
      expect(macroName.startsWith('govuk')).toBe(true);
      expect(fixtures.length).toBeGreaterThan(0);
    });

    it.each(fixtures.map((fixture) => [fixture.name, fixture] as const))(
      'fixture "%s" matches official HTML',
      (_name, fixture) => {
        const rendered = renderGovukFixture(env, componentFolder, fixture.options);
        expect(normalizeGovukHtml(rendered)).toBe(normalizeGovukHtml(fixture.html));
      },
    );
  });
});
