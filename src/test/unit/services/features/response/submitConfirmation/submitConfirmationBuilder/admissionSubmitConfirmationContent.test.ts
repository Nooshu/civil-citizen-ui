import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {FullAdmission} from 'models/fullAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {
  getContactYouStatement,
  getFAPayByDateNextSteps,
  getFAPayByDateStatus,
  getFAPayByInstallmentsNextSteps,
  getFAPayByInstallmentsStatus,
  getFAPayImmediatelyNextSteps,
  getFAPAyImmediatelyStatus,
  getFARejectOfferContent,
  getfinancialDetails,
  getNextStepsTitle,
  getNotPayImmediatelyContent,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';
const claimId = '5129';

function createClaim(paymentOption: PaymentOptionType, respondentType = PartyType.INDIVIDUAL): Claim {
  const claim = new Claim();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01T00:00:00.000Z');
  claim.respondentPaymentDeadline = new Date('2035-06-15T00:00:00.000Z');
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.COMPANY;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Defendant'});
  claim.respondent1.type = respondentType;
  return claim;
}

describe('admissionSubmitConfirmationContent', () => {
  it('should build FA pay immediately status', () => {
    const claim = createClaim(PaymentOptionType.IMMEDIATELY);
    const result = getFAPAyImmediatelyStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
  });

  it('should build FA pay by date status', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE);
    const result = getFAPayByDateStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
  });

  it('should build FA pay by installments status', () => {
    const claim = createClaim(PaymentOptionType.INSTALMENTS);
    const result = getFAPayByInstallmentsStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
  });

  it('should return contact you statement', () => {
    const result = getContactYouStatement(lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU');
  });

  it('should return financial details for business respondent', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE, PartyType.ORGANISATION);
    const result = getfinancialDetails(claimId, claim, lang);
    expect(result).toHaveLength(3);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.SEND_FINANCIAL_DETAILS');
  });

  it('should return empty financial details for individual respondent', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE, PartyType.INDIVIDUAL);
    expect(getfinancialDetails(claimId, claim, lang)).toEqual([]);
  });

  it('should return next steps title', () => {
    expect(getNextStepsTitle(lang)[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
  });

  it('should build FA pay immediately next steps', () => {
    const claim = createClaim(PaymentOptionType.IMMEDIATELY);
    const result = getFAPayImmediatelyNextSteps(claimId, claim, lang);
    expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT');
    expect(result[1].data?.href).toContain('/dashboard/5129/contact-them');
  });

  it('should build FA pay by date next steps', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE);
    const result = getFAPayByDateNextSteps(claimId, claim, lang);
    expect(result[0].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
    expect(result.some(s => s.data?.text?.toString().includes('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER'))).toBe(true);
  });

  it('should build FA pay by installments next steps', () => {
    const claim = createClaim(PaymentOptionType.INSTALMENTS);
    const result = getFAPayByInstallmentsNextSteps(claimId, claim, lang);
    expect(result[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
  });

  it('should build not pay immediately content', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE);
    const result = getNotPayImmediatelyContent(claim, lang);
    expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.YOU_WONT_PAY_IMMEDIATELY');
  });

  it('should build reject offer content', () => {
    const claim = createClaim(PaymentOptionType.BY_SET_DATE);
    const result = getFARejectOfferContent(claim, lang);
    expect(result[0].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_OFFER');
    expect(result[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.COURT_DECIDE_HOW_TO_PAY');
  });
});
