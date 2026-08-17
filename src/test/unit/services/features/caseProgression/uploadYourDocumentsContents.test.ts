import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {
  APPLICATION_TYPE_URL,
  MAKE_APPLICATION_TO_COURT,
  TYPES_OF_DOCUMENTS_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

describe('uploadYourDocumentsContents', () => {
  it('should include GA NRO application type url when enabled for claimant', () => {
    const claim = new Claim();
    claim.id = '123';
    claim.totalClaimAmount = 1000;
    claim.caseRole = CaseRole.CLAIMANT;
    jest.spyOn(claim, 'isClaimant').mockReturnValue(true);

    const result = getUploadYourDocumentsContents('123', claim, true);

    expect(result.some(section => section.data?.text === 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')).toBe(true);
    expect(result.some(section =>
      section.data?.href === constructResponseUrlWithIdParams('123', APPLICATION_TYPE_URL),
    )).toBe(true);
    expect(result.some(section =>
      section.data?.href === constructResponseUrlWithIdParams('123', TYPES_OF_DOCUMENTS_URL),
    )).toBe(true);
    expect(result.some(section =>
      section.data?.cancelHref === constructResponseUrlWithIdParams('123', DASHBOARD_CLAIMANT_URL),
    )).toBe(true);
  });

  it('should use MAKE_APPLICATION_TO_COURT when GA NRO disabled for defendant', () => {
    const claim = new Claim();
    claim.id = '456';
    claim.totalClaimAmount = 500;
    jest.spyOn(claim, 'isClaimant').mockReturnValue(false);

    const result = getUploadYourDocumentsContents('456', claim, false);

    expect(result.some(section => section.data?.href === MAKE_APPLICATION_TO_COURT)).toBe(true);
    expect(result.some(section =>
      section.data?.cancelHref === constructResponseUrlWithIdParams('456', DEFENDANT_SUMMARY_URL),
    )).toBe(true);
  });
});
