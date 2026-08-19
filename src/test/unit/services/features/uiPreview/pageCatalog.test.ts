import {readFileSync, readdirSync} from 'fs';
import {join} from 'path';
import {
  getUiPreviewPageCatalog,
  UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID,
  UI_PREVIEW_FIXTURE_CLAIM_ID,
  UI_PREVIEW_FULL_ADMIT_CLAIM_ID,
  UI_PREVIEW_GA_CLAIM_ID,
  UI_PREVIEW_PART_ADMIT_CLAIM_ID,
  UI_PREVIEW_QM_QUERY_ID,
  UI_PREVIEW_SOM_CLAIM_ID,
} from 'services/features/uiPreview/pageCatalog';
import {
  APPLICATION_TYPE_URL,
  CITIZEN_DISABILITY_URL,
  CLAIM_AMOUNT_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  CLAIMANT_TASK_LIST_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  ELIGIBILITY_CLAIMANT_AGE_URL,
  PRIVACY_POLICY_URL,
  QM_QUERY_DETAILS_URL,
  QM_VIEW_QUERY_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';

describe('UI Preview page catalog', () => {
  it('should include public ready pages and fixture claim links', () => {
    const catalog = getUiPreviewPageCatalog();
    expect(catalog.length).toBeGreaterThan(0);

    const allPages = catalog.flatMap((group) => group.pages);
    expect(allPages.length).toBeGreaterThan(200);
    expect(allPages.find((page) => page.path.includes('help-with-fees-reference') && page.path.startsWith('/claim/'))).toBeUndefined();
    expect(allPages.find((page) => page.path === ELIGIBILITY_CLAIMANT_AGE_URL)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === CITIZEN_DISABILITY_URL.replace(':id', UI_PREVIEW_SOM_CLAIM_ID))?.status).toBe('ready');
    expect(allPages.find((page) => page.path === DASHBOARD_CLAIMANT_URL.replace(':id', UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID))?.status).toBe('ready');
    const privacy = allPages.find((page) => page.path === PRIVACY_POLICY_URL);
    expect(privacy?.status).toBe('ready');

    const defendantSummary = allPages.find((page) =>
      page.path === DEFENDANT_SUMMARY_URL.replace(':id', UI_PREVIEW_FIXTURE_CLAIM_ID));
    expect(defendantSummary?.status).toBe('ready');
  });

  it('should mark claim issue, claimant response, case progression and GA as ready', () => {
    const allPages = getUiPreviewPageCatalog().flatMap((group) => group.pages);

    expect(allPages.find((page) => page.path === CLAIM_AMOUNT_URL)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === CLAIMANT_TASK_LIST_URL)?.status).toBe('ready');

    const fullAdmitTaskList = CLAIMANT_RESPONSE_TASK_LIST_URL.replace(':id', UI_PREVIEW_FULL_ADMIT_CLAIM_ID);
    const partAdmitTaskList = CLAIMANT_RESPONSE_TASK_LIST_URL.replace(':id', UI_PREVIEW_PART_ADMIT_CLAIM_ID);
    const uploadDocuments = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID);
    const applicationType = APPLICATION_TYPE_URL.replace(':id', UI_PREVIEW_GA_CLAIM_ID);
    const viewQueries = QM_VIEW_QUERY_URL.replace(':id', UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID);
    const queryDetails = QM_QUERY_DETAILS_URL
      .replace(':id', UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID)
      .replace(':queryId', UI_PREVIEW_QM_QUERY_ID);

    expect(allPages.find((page) => page.path === fullAdmitTaskList)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === partAdmitTaskList)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === uploadDocuments)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === applicationType)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === viewQueries)?.status).toBe('ready');
    expect(allPages.find((page) => page.path === queryDetails)?.status).toBe('ready');
    expect(allPages.every((page) => page.status === 'ready')).toBe(true);
  });

  it('should have WireMock mappings for each extra fixture claim', () => {
    const mappingsDir = join(__dirname, '../../../../../../compose/ui-preview-mappings');
    const mappingJson = readdirSync(mappingsDir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => readFileSync(join(mappingsDir, name), 'utf8'))
      .join('\n');

    [
      UI_PREVIEW_FIXTURE_CLAIM_ID,
      UI_PREVIEW_FULL_ADMIT_CLAIM_ID,
      UI_PREVIEW_PART_ADMIT_CLAIM_ID,
      UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID,
      UI_PREVIEW_GA_CLAIM_ID,
      UI_PREVIEW_SOM_CLAIM_ID,
    ].forEach((claimId) => {
      expect(mappingJson).toContain(`/cases/${claimId}`);
    });
    expect(mappingJson).toContain(UI_PREVIEW_QM_QUERY_ID);
    expect(mappingJson).toContain('"caseMessages"');
  });
});
