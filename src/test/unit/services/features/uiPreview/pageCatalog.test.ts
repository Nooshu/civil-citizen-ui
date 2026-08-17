import {getUiPreviewPageCatalog, UI_PREVIEW_FIXTURE_CLAIM_ID} from 'services/features/uiPreview/pageCatalog';
import {PRIVACY_POLICY_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';

describe('UI Preview page catalog', () => {
  it('should include public ready pages and fixture claim links', () => {
    const catalog = getUiPreviewPageCatalog();
    expect(catalog.length).toBeGreaterThan(0);

    const allPages = catalog.flatMap((group) => group.pages);
    const privacy = allPages.find((page) => page.path === PRIVACY_POLICY_URL);
    expect(privacy?.status).toBe('ready');

    const defendantSummary = allPages.find((page) =>
      page.path === DEFENDANT_SUMMARY_URL.replace(':id', UI_PREVIEW_FIXTURE_CLAIM_ID));
    expect(defendantSummary?.status).toBe('ready');
  });

  it('should mark stub journeys distinctly from ready ones', () => {
    const catalog = getUiPreviewPageCatalog();
    const allPages = catalog.flatMap((group) => group.pages);
    expect(allPages.some((page) => page.status === 'ready')).toBe(true);
    expect(allPages.some((page) => page.status === 'stub')).toBe(true);
  });
});
