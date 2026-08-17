import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {
  getButtonContent,
  getClaimantOrDefendant,
  getRequestForReconsiderationCommentsConfirmationContent,
  getRequestForReviewCommentsContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent';
import {DEFENDANT_SUMMARY_URL} from 'routes/urls';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('requestForReviewCommentsContent', () => {
  const createClaim = (role: CaseRole) => {
    const claim = new Claim();
    claim.id = '55';
    claim.totalClaimAmount = 2000;
    claim.caseRole = role;
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
    claim.applicant1.partyDetails.partyName = 'Alice Claimant';
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({});
    claim.respondent1.partyDetails.partyName = 'Bob Defendant';
    return claim;
  };

  it('should build comments content for claimant', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const content = getRequestForReviewCommentsContent(claim, '55');
    expect(content[0].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MICRO_TEXT');
    expect(content[1].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MAIN_TITLE');
    expect(getClaimantOrDefendant(claim)).toBe('Bob Defendant');
  });

  it('should return claimant name for defendant role', () => {
    expect(getClaimantOrDefendant(createClaim(CaseRole.DEFENDANT))).toBe('Alice Claimant');
  });

  it('should build button content', () => {
    const button = getButtonContent('55');
    expect(button[0].data.text).toBe('COMMON.BUTTONS.CONTINUE');
    expect(button[0].data.cancelHref).toContain('55');
  });

  it('should build comments confirmation content', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const content = getRequestForReconsiderationCommentsConfirmationContent(claim, 'en', DEFENDANT_SUMMARY_URL);
    expect(content[0].data.text).toBe('PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(content.some(s => s.data?.text === 'PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.JUDGE_WILL_REVIEW')).toBe(true);
  });
});
