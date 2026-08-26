import * as fs from 'fs';
import * as urls from '../../../main/routes/urls';
import {A11Y_IGNORED_URL_EXCEPTIONS, A11Y_IGNORED_URLS_WITH_MOCKS, IGNORED_URLS} from '../../a11y/ignored-urls';
import {getScannedA11yUrls, resolveA11yMockUrl} from '../../a11y/a11y-scan';
import {GOVUK_MACRO_HTMLCS_IGNORES} from '../../a11y/pa11y-options';
import {translateUrlToFilePath} from '../../utils/mocks/a11y/urlToFileName';

function mockExists(url: string): boolean {
  return fs.existsSync(translateUrlToFilePath(resolveA11yMockUrl(url)));
}

/**
 * Guards the Pa11y mock-suite policy: scan every citizen GET that has a fixture;
 * ignore scanner-vs-GOV.UK conflicts in Pa11y options, not by dropping URLs.
 */
describe('Pa11y ignored URLs vs HTML mocks', () => {
  const scanned = getScannedA11yUrls();
  const ignored = [...new Set(IGNORED_URLS)];
  const allAppUrls = [...new Set(Object.values(urls) as string[])]
    .filter((url) => typeof url === 'string' && !url.startsWith('http://') && !url.startsWith('https://'));

  it('scans every non-ignored in-app URL that has a matching mock', () => {
    const missing = scanned.filter((url) => !mockExists(url));
    expect(missing).toEqual([]);
  });

  it('does not ignore a citizen GET that has a mock unless it is an explicit exception', () => {
    const ignoredWithMock = ignored.filter((url) => mockExists(url)).sort();
    expect(ignoredWithMock).toEqual([...A11Y_IGNORED_URLS_WITH_MOCKS].sort());
  });

  it('documents a reason for every ignored-with-mock exception', () => {
    expect(A11Y_IGNORED_URL_EXCEPTIONS.every((entry) => entry.reason.length > 0)).toBe(true);
    expect(A11Y_IGNORED_URL_EXCEPTIONS.map((entry) => entry.url).sort()).toEqual([...A11Y_IGNORED_URLS_WITH_MOCKS].sort());
  });

  it('scans more than the three core GETs when mocks exist', () => {
    expect(scanned).toEqual(expect.arrayContaining([
      urls.DASHBOARD_URL,
      urls.MAKE_CLAIM,
      urls.CITIZEN_DETAILS_URL,
      urls.CLAIM_TIMELINE_URL,
      urls.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,
      urls.MEDIATION_UPLOAD_DOCUMENTS,
      urls.CLAIM_FEE_BREAKUP,
    ]));
    expect(scanned.length).toBeGreaterThan(300);
  });

  it('covers every in-app urls.ts path as either scanned or ignored', () => {
    const ignoredSet = new Set(ignored);
    const scannedSet = new Set(scanned);
    const leftover = allAppUrls.filter((url) => !ignoredSet.has(url) && !scannedSet.has(url));
    expect(leftover).toEqual([]);
  });

  it('ignores HTML_CodeSniffer codes that conflict with official GOV.UK tables and headings', () => {
    expect(GOVUK_MACRO_HTMLCS_IGNORES).toEqual(expect.arrayContaining([
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H39.3.LayoutTable',
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2',
    ]));
  });
});
