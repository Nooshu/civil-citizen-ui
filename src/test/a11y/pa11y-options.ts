/**
 * Shared Pa11y options for Civil Citizen UI (CUI) accessibility (a11y) scans.
 *
 * @remarks Pa11y 9’s default runner is HTML_CodeSniffer (`htmlcs`) against WCAG 2.0 AA
 *   (`WCAG2AA`). That is **not** a Web Content Accessibility Guidelines (WCAG) 2.2 AA
 *   audit. Official GOV.UK Frontend macros are the UI source of truth: if a scanner
 *   code fires on Design System output (for example `govukTable` captions), ignore the
 *   code here. Do **not** drop the URL from the suite or rewrite macro HTML to silence
 *   HTML_CodeSniffer or axe.
 * @see AGENTS.md — GOV.UK Frontend (prefer GOV.UK over axe)
 */
export const GOVUK_MACRO_HTMLCS_IGNORES = [
  /**
   * HTML_CodeSniffer treats a table with a caption as a layout table. GOV.UK `govukTable`
   * (and matching Design System table markup) uses a caption on data tables.
   */
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H39.3.LayoutTable',
  /**
   * Heading-vs-caption false positives on GOV.UK header, cookie banner, and details copy.
   * Already ignored on the live-URL Pa11y helper (`a11y.ts`).
   */
  'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2',
];

/**
 * Pa11y launch options used by the HTML-mock harness (`a11y.mock-test.ts`).
 */
export const A11Y_MOCK_PA11Y_OPTIONS = {
  hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
  standard: 'WCAG2AA',
  includeWarnings: true,
  ignore: [...GOVUK_MACRO_HTMLCS_IGNORES],
  log: {
    debug: console.log,
    error: console.error,
    info: console.info,
  },
  chromeLaunchConfig: {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  },
};
