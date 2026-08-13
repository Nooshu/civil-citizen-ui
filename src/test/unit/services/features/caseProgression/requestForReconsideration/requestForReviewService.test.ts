import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  getCaseInfoContents,
  getRequestForReviewForm,
  getSummarySections,
  getSummarySectionsComments,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';

jest.mock('services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection', () => ({
  buildRequestForReconsideration: jest.fn(() => ({title: 'request'})),
  buildRequestForReconsiderationComments: jest.fn(() => ({title: 'comments'})),
  buildCaseInfoContents: jest.fn(() => [{type: 'TITLE', data: {text: 'case-info'}}]),
}));

describe('requestForReviewService', () => {
  it('should get claimant request for review form', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReviewClaimant = new RequestForReviewForm('claimant text');

    expect(getRequestForReviewForm(claim)).toEqual(new RequestForReviewForm('claimant text'));
  });

  it('should get defendant request for review form', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReviewDefendant = new RequestForReviewForm('defendant text');

    expect(getRequestForReviewForm(claim)).toEqual(new RequestForReviewForm('defendant text'));
  });

  it('should build summary sections', () => {
    const claim = new Claim();
    const sections = getSummarySections('1', claim, 'en');
    expect(sections.sections).toHaveLength(1);
    expect(sections.sections[0]).toEqual({title: 'request'});
  });

  it('should build summary sections comments', () => {
    const claim = new Claim();
    const sections = getSummarySectionsComments('1', claim, 'en');
    expect(sections.sections).toHaveLength(1);
    expect(sections.sections[0]).toEqual({title: 'comments'});
  });

  it('should build case info contents', () => {
    const claim = new Claim();
    expect(getCaseInfoContents('1', claim)).toEqual([{type: 'TITLE', data: {text: 'case-info'}}]);
  });
});
