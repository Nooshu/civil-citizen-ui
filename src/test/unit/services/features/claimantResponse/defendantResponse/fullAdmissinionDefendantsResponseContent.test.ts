import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {FullAdmission} from 'models/fullAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Explanation} from 'form/models/statementOfMeans/explanation';
import {
  buildFullAdmissionResponseContent,
  getReasonForNotPayingFullAmount,
} from 'services/features/claimantResponse/defendantResponse/fullAdmissinionDefendantsResponseContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function createFullAdmissionClaim(respondentType = PartyType.INDIVIDUAL): Claim {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = respondentType;
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
  claim.statementOfMeans = new StatementOfMeans();
  claim.statementOfMeans.explanation = new Explanation('Cannot afford all');
  return claim;
}

describe('fullAdmissinionDefendantsResponseContent', () => {
  it('should return reason for not paying when individual', () => {
    const claim = createFullAdmissionClaim();
    const result = getReasonForNotPayingFullAmount(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.UNABLE_TO_PAY_FULL_AMOUNT');
    expect(result[1].data?.text).toEqual('Cannot afford all');
  });

  it('should return empty reason for business respondent', () => {
    const claim = createFullAdmissionClaim(PartyType.ORGANISATION);
    expect(getReasonForNotPayingFullAmount(claim, lang)).toEqual([]);
  });

  it('should build full admission response content', () => {
    const claim = createFullAdmissionClaim();
    const result = buildFullAdmissionResponseContent(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION');
    expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.TOTAL_PAID_AMOUNT');
    expect(result[2].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PAYMENT_DATE');
    expect(result.some(s => s.data?.text === 'Cannot afford all')).toBe(true);
  });

  it('should build full admission content without reason for business', () => {
    const claim = createFullAdmissionClaim(PartyType.COMPANY);
    const result = buildFullAdmissionResponseContent(claim, lang);
    expect(result).toHaveLength(3);
  });
});
