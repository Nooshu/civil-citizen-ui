import {
  normalizeGovukHtml,
  toGovukMacroName,
} from './govukFrontendFixturesHelper';

describe('govukFrontendFixturesHelper', () => {
  it('maps hyphenated component folders to camelCase macro names', () => {
    expect(toGovukMacroName('button')).toBe('govukButton');
    expect(toGovukMacroName('back-link')).toBe('govukBackLink');
    expect(toGovukMacroName('service-navigation')).toBe('govukServiceNavigation');
  });

  it('normalises insignificant whitespace for HTML comparison', () => {
    expect(normalizeGovukHtml('<button>\n  Save\n</button>')).toBe('<button> Save </button>');
    expect(normalizeGovukHtml('<a>x</a>  <span>y</span>')).toBe('<a>x</a><span>y</span>');
    expect(normalizeGovukHtml('<div class="x" ><span>y</span></div>')).toBe(
      '<div class="x"><span>y</span></div>',
    );
  });
});
