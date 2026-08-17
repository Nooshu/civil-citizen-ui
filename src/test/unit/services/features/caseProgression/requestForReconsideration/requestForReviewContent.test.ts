import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  getButtonContent,
  getClaimantOrDefendant,
  getNameRequestForReconsideration,
  getRequestForReconsiderationConfirmationContent,
  getRequestForReconsiderationDocumentForConfirmation,
  getRequestForReviewContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';
import {DEFENDANT_SUMMARY_URL} from 'routes/urls';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('requestForReviewContent', () => {
  const createClaim = (role: CaseRole) => {
    const claim = new Claim();
    claim.id = '99';
    claim.totalClaimAmount = 1000;
    claim.caseRole = role;
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
    claim.applicant1.partyDetails.partyName = 'Claimant Name';
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({});
    claim.respondent1.partyDetails.partyName = 'Defendant Name';
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReconsiderationDeadline = new Date('2024-06-01');
    return claim;
  };

  it('should build request for review content for claimant', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const content = getRequestForReviewContent(claim, '99');
    expect(content[0].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT');
    expect(content[1].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE');
    expect(getClaimantOrDefendant(claim)).toBe('Defendant Name');
  });

  it('should return defendant full name for defendant role', () => {
    const claim = createClaim(CaseRole.DEFENDANT);
    expect(getClaimantOrDefendant(claim)).toBe('Claimant Name');
  });

  it('should return correct property name for claimant and defendant', () => {
    expect(getNameRequestForReconsideration(createClaim(CaseRole.CLAIMANT))).toBe('requestForReviewClaimant');
    expect(getNameRequestForReconsideration(createClaim(CaseRole.DEFENDANT))).toBe('requestForReviewDefendant');
  });

  it('should build button content with cancel url', () => {
    const button = getButtonContent('99');
    expect(button[0].data.text).toBe('COMMON.BUTTONS.CONTINUE');
    expect(button[0].data.cancelHref).toContain('99');
  });

  it('should build confirmation content', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const content = getRequestForReconsiderationConfirmationContent(claim, 'en', DEFENDANT_SUMMARY_URL);
    expect(content[0].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(content.some(s => s.data?.text === 'COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW')).toBe(true);
  });

  it('should return claimant document binary url', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    jest.spyOn(claim, 'isClaimant').mockReturnValue(true);
    claim.caseProgression.requestForReconsiderationDocument = {
      documentLink: {document_binary_url: 'http://claimant-doc'},
    } as CaseProgression['requestForReconsiderationDocument'];
    expect(getRequestForReconsiderationDocumentForConfirmation(claim)).toBe('http://claimant-doc');
  });

  it('should return defendant document binary url', () => {
    const claim = createClaim(CaseRole.DEFENDANT);
    jest.spyOn(claim, 'isClaimant').mockReturnValue(false);
    claim.caseProgression.requestForReconsiderationDocumentRes = {
      documentLink: {document_binary_url: 'http://defendant-doc'},
    } as CaseProgression['requestForReconsiderationDocumentRes'];
    expect(getRequestForReconsiderationDocumentForConfirmation(claim)).toBe('http://defendant-doc');
  });
});
