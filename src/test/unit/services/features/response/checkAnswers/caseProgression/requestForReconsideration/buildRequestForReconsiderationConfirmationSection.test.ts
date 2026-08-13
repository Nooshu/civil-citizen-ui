import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  buildCaseInfoContents,
  buildRequestForReconsideration,
  buildRequestForReconsiderationComments,
} from 'services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection';
import {
  REQUEST_FOR_RECONSIDERATION_COMMENTS_URL,
  REQUEST_FOR_RECONSIDERATION_URL,
} from 'routes/urls';

jest.mock('../../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimId = '123';
const lang = 'en';

function createClaim(role: CaseRole): Claim {
  const claim = new Claim();
  claim.caseRole = role;
  claim.totalClaimAmount = 5000;
  claim.caseProgression = new CaseProgression();
  claim.caseProgression.requestForReviewClaimant = {textArea: 'Claimant reasons'} as never;
  claim.caseProgression.requestForReviewDefendant = {textArea: 'Defendant reasons'} as never;
  return claim;
}

describe('buildRequestForReconsiderationConfirmationSection', () => {
  it('should build request for reconsideration for claimant', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const result = buildRequestForReconsideration(claim, claimId, lang);
    expect(result.summaryList.rows).toHaveLength(1);
    expect(result.summaryList.rows[0].key.text).toEqual('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE');
    expect(result.summaryList.rows[0].value.html).toContain('Claimant reasons');
    expect(result.summaryList.rows[0].actions?.items[0].href).toContain(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', claimId));
  });

  it('should build request for reconsideration for defendant', () => {
    const claim = createClaim(CaseRole.DEFENDANT);
    const result = buildRequestForReconsideration(claim, claimId, lang);
    expect(result.summaryList.rows[0].value.html).toContain('Defendant reasons');
  });

  it('should build request for reconsideration comments section', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const result = buildRequestForReconsiderationComments(claim, claimId, lang);
    expect(result.summaryList.rows[0].key.text).toEqual('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MAIN_TITLE');
    expect(result.summaryList.rows[0].actions?.items[0].href).toContain(REQUEST_FOR_RECONSIDERATION_COMMENTS_URL.replace(':id', claimId));
  });

  it('should build case info contents', () => {
    const claim = createClaim(CaseRole.CLAIMANT);
    const result = buildCaseInfoContents(claim, claimId, 'MICRO_TEXT');
    expect(result.some(s => s.data?.text === 'MICRO_TEXT' || s.data?.text === 'PAGES.CHECK_YOUR_ANSWER.TITLE')).toBe(true);
    expect(result.some(s => s.data?.text === 'COMMON.CASE_NUMBER_PARAM')).toBe(true);
    expect(result.some(s => s.data?.text === 'COMMON.CLAIM_AMOUNT_WITH_VALUE')).toBe(true);
  });
});
