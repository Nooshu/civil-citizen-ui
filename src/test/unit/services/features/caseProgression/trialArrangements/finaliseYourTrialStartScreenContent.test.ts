import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {DocumentType} from 'models/document/documentType';

describe('finaliseYourTrialStartScreenContent', () => {
  const createClaim = (isClaimant: boolean) => {
    const claim = new Claim();
    claim.id = '77';
    claim.totalClaimAmount = 1500;
    claim.caseRole = isClaimant ? CaseRole.CLAIMANT : CaseRole.DEFENDANT;
    claim.caseProgressionHearing = new CaseProgressionHearing([], null, new Date('2024-08-01'), null);
    claim.systemGeneratedCaseDocuments = [
      {
        value: {
          createdBy: 'Civil',
          documentLink: {
            document_url: 'http://dm/documents/sdo',
            document_filename: 'sdo.pdf',
            document_binary_url: 'http://dm/documents/sdo/binary',
          },
          documentName: 'sdo.pdf',
          documentType: DocumentType.SDO_ORDER,
        },
      },
      {
        value: {
          createdBy: 'Civil',
          documentLink: {
            document_url: 'http://dm/documents/dq',
            document_filename: 'dq.pdf',
            document_binary_url: 'http://dm/documents/dq/binary',
          },
          documentName: 'dq.pdf',
          documentType: DocumentType.DIRECTIONS_QUESTIONNAIRE,
        },
      },
    ] as Claim['systemGeneratedCaseDocuments'];
    jest.spyOn(claim, 'isClaimant').mockReturnValue(isClaimant);
    jest.spyOn(claim, 'fourWeeksBeforeHearingDate').mockReturnValue(new Date('2024-07-04'));
    return claim;
  };

  it('should build content for claimant including expected keys', () => {
    const claim = createClaim(true);
    const content = getFinaliseTrialArrangementContents('77', claim, 'en');

    expect(content.some(s => s.data?.text === 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.IS_THE_CASE_READY_FOR_TRIAL')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.START_NOW')).toBe(true);
    expect(content.some(s => s.data?.cancelHref?.includes('claimantNewDesign'))).toBe(true);
  });

  it('should build content for defendant with defendant cancel url', () => {
    const claim = createClaim(false);
    const content = getFinaliseTrialArrangementContents('77', claim, 'en');

    expect(content.some(s => s.data?.text === 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE')).toBe(true);
    expect(content.some(s => s.data?.cancelHref?.includes('/defendant'))).toBe(true);
  });
});
