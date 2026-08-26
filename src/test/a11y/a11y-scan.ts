import * as urls from '../../main/routes/urls';
import {IGNORED_URLS} from './ignored-urls';

/**
 * Claim, general-application, and query-management ids used in captured Pa11y HTML mocks.
 */
export const A11Y_MOCK_CLAIM_ID = '1645882162449409';
export const A11Y_MOCK_APP_ID = '1720536653906339';
export const A11Y_MOCK_QM_TYPE = 'SEND_DOCUMENTS';
export const A11Y_MOCK_QM_QUALIFY_OPTION = 'ENFORCEMENT_REQUESTS';
export const A11Y_MOCK_QUERY_ID = '1';

/**
 * Substitute path params so `translateUrlToFilePath` can resolve a fixture.
 *
 * @param url - Route pattern from `urls.ts`
 */
export function resolveA11yMockUrl(url: string): string {
  return url
    .replace(':id', A11Y_MOCK_CLAIM_ID)
    .replace(':appId', A11Y_MOCK_APP_ID)
    .replace(':qmType', A11Y_MOCK_QM_TYPE)
    .replace(':qmQualifyOption', A11Y_MOCK_QM_QUALIFY_OPTION)
    .replace(':queryId', A11Y_MOCK_QUERY_ID);
}

function isHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Citizen GET paths Pa11y should visit: every `urls.ts` export except ignores and absolute URLs.
 *
 * @remarks Duplicates in `urls.ts` are collapsed so Jenkins chunks do not scan the same path twice.
 */
export function getScannedA11yUrls(): string[] {
  const seen = new Set<string>();
  const scanned: string[] = [];
  for (const url of Object.values(urls) as string[]) {
    if (typeof url !== 'string' || seen.has(url)) {
      continue;
    }
    seen.add(url);
    if (isHttpUrl(url) || IGNORED_URLS.includes(url)) {
      continue;
    }
    scanned.push(url);
  }
  return scanned;
}
