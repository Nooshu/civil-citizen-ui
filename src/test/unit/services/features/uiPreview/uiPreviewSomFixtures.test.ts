import {readFileSync} from 'fs';
import {join} from 'path';
import {YesNo} from 'form/models/yesNo';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {UI_PREVIEW_FIXTURE_CLAIM_ID, UI_PREVIEW_SOM_CLAIM_ID} from 'services/features/uiPreview/pageCatalog';

const mappingsDir = join(__dirname, '../../../../../../compose/ui-preview-mappings');

const loadCcdCaseData = (mappingFile: string, claimId: string) => {
  const mappings = JSON.parse(readFileSync(join(mappingsDir, mappingFile), 'utf8')).mappings;
  const caseMapping = mappings.find((mapping: {request: {urlPath: string}}) => mapping.request.urlPath === `/cases/${claimId}`);
  return caseMapping.response.jsonBody;
};

describe('UI Preview statement-of-means and mediation fixtures', () => {
  it('should translate the SoM WireMock stub into part-admit not-already-paid with an owed amount', () => {
    const ccd = loadCcdCaseData('ui-preview-som.json', UI_PREVIEW_SOM_CLAIM_ID);
    const claim = translateCCDCaseDataToCUIModel(ccd.case_data);

    expect(claim.isPartialAdmission()).toBe(true);
    expect(claim.partialAdmission.alreadyPaid.option).toBe(YesNo.NO);
    expect(claim.partialAdmission.howMuchDoYouOwe.amount).toBe(400);
    expect(claim.partialAdmission.whyDoYouDisagree.text).toBe('I only owe part of the amount claimed.');
    expect(claim.partialAdmission.paymentIntention.paymentOption).toBe('INSTALMENTS');
  });

  it('should include a mediation agreement document on the awaiting-defendant WireMock stub', () => {
    const ccd = loadCcdCaseData('ui-preview-claims.json', UI_PREVIEW_FIXTURE_CLAIM_ID);
    expect(ccd.case_data.mediationAgreement.document.document_filename).toBe('mediation-agreement.pdf');
    expect(ccd.case_data.mediationAgreement.document.document_binary_url).toContain('/binary');
  });
});
