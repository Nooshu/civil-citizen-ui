import {readFileSync} from 'fs';
import {join} from 'path';
import {Claim} from 'models/claim';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {UI_PREVIEW_FULL_ADMIT_CLAIM_ID, UI_PREVIEW_PART_ADMIT_CLAIM_ID} from 'services/features/uiPreview/pageCatalog';

const mappingsDir = join(__dirname, '../../../../../../compose/ui-preview-mappings');
const redisPath = join(__dirname, '../../../../../../src/main/modules/e2eConfiguration/uiPreviewRedisData.json');

const loadCcdCaseData = (mappingFile: string, claimId: string) => {
  const mappings = JSON.parse(readFileSync(join(mappingsDir, mappingFile), 'utf8')).mappings;
  const caseMapping = mappings.find((mapping: {request: {urlPath: string}}) => mapping.request.urlPath === `/cases/${claimId}`);
  return caseMapping.response.jsonBody;
};

const loadRedisCaseData = (claimId: string) => {
  const entries = JSON.parse(readFileSync(redisPath, 'utf8'));
  return entries.find((entry: {id: string}) => entry.id === `${claimId}someID`).case_data;
};

describe('UI Preview claimant response fixtures', () => {
  it.each([
    ['ui-preview-full-admit.json', UI_PREVIEW_FULL_ADMIT_CLAIM_ID],
    ['ui-preview-part-admit.json', UI_PREVIEW_PART_ADMIT_CLAIM_ID],
  ])('should translate %s CCD stub and build a task list', (mappingFile, claimId) => {
    const ccd = loadCcdCaseData(mappingFile, claimId);
    const claim = translateCCDCaseDataToCUIModel(ccd.case_data);
    claim.ccdState = ccd.state;
    claim.id = String(ccd.id);

    const taskLists = getClaimantResponseTaskLists(claim, claimId, 'en', false, false);
    expect(taskLists.length).toBeGreaterThan(0);
    expect(taskLists[0].tasks.length).toBeGreaterThan(0);
  });

  it.each([
    UI_PREVIEW_FULL_ADMIT_CLAIM_ID,
    UI_PREVIEW_PART_ADMIT_CLAIM_ID,
  ])('should build a task list from Redis fixture %s', (claimId) => {
    const claim = Object.assign(new Claim(), loadRedisCaseData(claimId));
    const taskLists = getClaimantResponseTaskLists(claim, claimId, 'en', false, false);
    expect(taskLists.length).toBeGreaterThan(0);
    expect(taskLists[0].tasks.length).toBeGreaterThan(0);
  });
});
