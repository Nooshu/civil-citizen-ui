import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {YesNo} from 'form/models/yesNo';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildPartAdmitNotPaidResponseContent,
  buildPartAdmitNotPaidResponseForHowTheyWantToPay,
  getTheirDefence,
} from 'services/features/claimantResponse/defendantResponse/partAdmitNotPaidDefendantsResponseContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function createPartAdmitClaim(paymentOption: PaymentOptionType): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(400, 1000);
  claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree('Not that much');
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
  claim.partialAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
  return claim;
}

describe('partAdmitNotPaidDefendantsResponseContent', () => {
  it('should build their defence section', () => {
    const result = getTheirDefence('Defence text', lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE');
    expect(result[2].data?.text).toEqual('Defence text');
  });

  it('should build content for pay installments', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.INSTALMENTS);
    expect(claim.responseStatus).toEqual(ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS);
    const result = buildPartAdmitNotPaidResponseContent(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE');
    expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU');
    expect(result.some(s => s.data?.text === 'Not that much')).toBe(true);
  });

  it('should build content for pay immediately', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
    expect(claim.responseStatus).toEqual(ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY);
    const result = buildPartAdmitNotPaidResponseContent(claim, lang);
    expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_IMMEDIATELY');
  });

  it('should build content for pay by date', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
    expect(claim.responseStatus).toEqual(ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE);
    const result = buildPartAdmitNotPaidResponseContent(claim, lang);
    expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE');
  });

  it('should build how they want to pay content', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
    const result = buildPartAdmitNotPaidResponseForHowTheyWantToPay(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE');
  });
});
