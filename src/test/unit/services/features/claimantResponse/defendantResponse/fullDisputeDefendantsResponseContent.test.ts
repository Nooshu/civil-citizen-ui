import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {Defence} from 'form/models/defence';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {CCDHowWasThisAmountPaid} from 'models/ccdResponse/ccdRespondToClaim';
import {
  buildFullDisputePaidFullResponseContent,
  buildFullDisputePaidLessResponseContent,
  buildFullDisputeResponseContent,
  generateTableRowsForEvidence,
  generateTableRowsForTOEs,
  getDisagreementStatementWithEvidence,
  getDisagreementStatementWithTimeline,
  getHowTheyPaid,
  getPaymentDate,
  getTheirDefence,
  getTheirEvidence,
  getTheirTOEs,
  getWhyTheyDisagreeWithClaim,
} from 'services/features/claimantResponse/defendantResponse/fullDisputeDefendantsResponseContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function createBaseClaim(): Claim {
  const claim = new Claim();
  claim.id = '123';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'John Defendant'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  return claim;
}

describe('fullDisputeDefendantsResponseContent', () => {
  describe('table generators', () => {
    it('should generate timeline table rows', () => {
      const rows = [new TimelineRow(15, 1, 2024, 'Event happened')];
      const result = generateTableRowsForTOEs(rows, lang);
      expect(result).toHaveLength(1);
      expect(result[0][1].text).toEqual('Event happened');
    });

    it('should generate evidence table rows', () => {
      const rows = [new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Contract')];
      const result = generateTableRowsForEvidence(rows, lang);
      expect(result).toHaveLength(1);
      expect(result[0][1].text).toEqual('Contract');
    });
  });

  describe('getTheirTOEs', () => {
    it('should return empty when no timeline', () => {
      expect(getTheirTOEs(createBaseClaim(), lang)).toEqual([]);
    });

    it('should return timeline table for reject all claim', () => {
      const claim = createBaseClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      claim.rejectAllOfClaim.timeline = new DefendantTimeline([new TimelineRow(15, 1, 2024, 'Event')], 'comment');
      const result = getTheirTOEs(claim, lang);
      expect(result[0].data?.text).toContain('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_TOE');
      expect(result[1].data?.tableRows).toHaveLength(1);
    });

    it('should return document link when timeline document exists', () => {
      const claim = createBaseClaim();
      claim.defendantResponseTimelineDocument = {
        document_binary_url: 'http://dm/documents/abc-123/binary',
        document_filename: 'timeline.pdf',
      } as never;
      const result = getTheirTOEs(claim, lang);
      expect(result[1].data?.href).toContain('abc-123');
      expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.DOWNLOAD_TIMELINE');
    });
  });

  describe('evidence and disagreement helpers', () => {
    it('should return timeline disagreement when comment exists', () => {
      const claim = createBaseClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      claim.rejectAllOfClaim.timeline = new DefendantTimeline([], 'Disagree timeline');
      expect(getDisagreementStatementWithTimeline(claim, lang)[1].data?.text).toEqual('Disagree timeline');
    });

    it('should return empty disagreement when no comment', () => {
      expect(getDisagreementStatementWithTimeline(createBaseClaim(), lang)).toEqual([]);
    });

    it('should return evidence table when evidence items exist', () => {
      const claim = createBaseClaim();
      claim.evidence = new Evidence('comment', [new EvidenceItem(EvidenceType.OTHER, 'Photo')]);
      const result = getTheirEvidence(claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_EVIDENCE');
      expect(result[1].data?.tableRows).toHaveLength(1);
    });

    it('should return empty evidence when none', () => {
      expect(getTheirEvidence(createBaseClaim(), lang)).toEqual([]);
    });

    it('should return evidence disagreement when comment exists', () => {
      const claim = createBaseClaim();
      claim.evidence = new Evidence('Evidence disagree', []);
      expect(getDisagreementStatementWithEvidence(claim, lang)[1].data?.text).toEqual('Evidence disagree');
    });

    it('should return empty evidence disagreement when no comment', () => {
      expect(getDisagreementStatementWithEvidence(createBaseClaim(), lang)).toEqual([]);
    });
  });

  describe('content builders', () => {
    it('should build getTheirDefence sections', () => {
      const result = getTheirDefence('Not liable', lang);
      expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
      expect(result[2].data?.text).toEqual('Not liable');
    });

    it('should build payment date and how paid sections', () => {
      expect(getPaymentDate(new Date('2024-02-01'), lang)[0].data?.text)
        .toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_PAID_THIS_AMOUNT');
      expect(getHowTheyPaid(CCDHowWasThisAmountPaid.BACS, lang)[1].data?.text)
        .toEqual('COMMON.TYPE_OF_PAYMENT.BACS');
      expect(getHowTheyPaid('Custom method', lang)[1].data?.text).toEqual('Custom method');
    });

    it('should build why they disagree section', () => {
      expect(getWhyTheyDisagreeWithClaim('Reason', lang)[1].data?.text).toEqual('Reason');
    });

    it('should build full dispute response content', () => {
      const claim = createBaseClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      claim.rejectAllOfClaim.defence = new Defence('I dispute everything');
      const result = buildFullDisputeResponseContent(claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_STATEMENT');
      expect(result.some(s => s.data?.text === 'I dispute everything')).toBe(true);
    });

    it('should build paid less response content', () => {
      const claim = createBaseClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 200, date: new Date('2024-01-01'), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree('Paid less reason');
      const result = buildFullDisputePaidLessResponseContent(claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_LESS_STATEMENT');
      expect(result.some(s => s.data?.text === 'Paid less reason')).toBe(true);
    });

    it('should build paid full response content', () => {
      const claim = createBaseClaim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 1000, date: new Date('2024-01-01'), day: '1', month: '1', year: '2024', text: CCDHowWasThisAmountPaid.CHEQUE,
      });
      const result = buildFullDisputePaidFullResponseContent(claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.REJECT_CLAIM_PAID_FULL_STATEMENT');
    });
  });
});
