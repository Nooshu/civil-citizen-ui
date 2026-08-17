import {Request} from 'express';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {RepaymentPlan} from 'form/models/repaymentPlan';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {FullAdmission} from 'models/fullAdmission';
import {ResponseType} from 'form/models/responseType';
import {
  getRespondSettlementAgreementText,
} from 'services/features/settlementAgreement/respondSettlementAgreementService';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

function createRequest(lang = 'en'): Request {
  return {query: {lang}, cookies: {}} as unknown as Request;
}

function baseClaim(): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.ORGANISATION;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = PartyType.ORGANISATION;
  claim.claimantResponse = new ClaimantResponse();
  return claim;
}

describe('respondSettlementAgreementService', () => {
  it('should build text for court accepted pay by set date', () => {
    const claim = baseClaim();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date('2035-06-01');
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
    jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.BY_SET_DATE);

    const result = getRespondSettlementAgreementText(claim, createRequest()) as Record<string, string>;
    expect(result.agreementText).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE');
    expect(result.claimant).toEqual('Claimant Co');
    expect(result.defendant).toEqual('Dave');
  });

  it('should build text for court accepted installments', () => {
    const claim = baseClaim();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 50,
      repaymentFrequency: TransactionSchedule.WEEK,
      firstRepaymentDate: new Date('2035-01-01'),
    } as RepaymentPlan;
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
    jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.INSTALMENTS);

    const result = getRespondSettlementAgreementText(claim, createRequest()) as Record<string, string>;
    expect(result.agreementText).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN');
  });

  it('should build text for court accepted immediately', () => {
    const claim = baseClaim();
    claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2035-06-01');
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
    jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.IMMEDIATELY);

    const result = getRespondSettlementAgreementText(claim, createRequest()) as Record<string, string>;
    expect(result.agreementText).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_IMMEDIATELY_PLAN');
  });

  it('should build text for defendant pay by set date when court did not accept claimant plan', () => {
    const claim = baseClaim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.partialAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
    jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(true);

    const result = getRespondSettlementAgreementText(claim, createRequest()) as Record<string, string>;
    expect(result.agreementText).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE');
  });

  it('should build text for defendant installments when court did not accept claimant plan', () => {
    const claim = baseClaim();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.fullAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: TransactionSchedule.MONTH,
      firstRepaymentDate: new Date('2035-01-01'),
    } as RepaymentPlan;
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
    jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(false);
    jest.spyOn(claim, 'isFAPaymentOptionBySetDate').mockReturnValue(false);
    jest.spyOn(claim, 'isFAPaymentOptionInstallments').mockReturnValue(true);

    const result = getRespondSettlementAgreementText(claim, createRequest()) as Record<string, string>;
    expect(result.agreementText).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN');
  });

  it('should use cookie lang when query lang missing', () => {
    const claim = baseClaim();
    jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
    jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(false);
    jest.spyOn(claim, 'isFAPaymentOptionBySetDate').mockReturnValue(false);
    jest.spyOn(claim, 'isFAPaymentOptionInstallments').mockReturnValue(false);
    jest.spyOn(claim, 'isPAPaymentOptionInstallments').mockReturnValue(false);
    const req = {query: {}, cookies: {lang: 'cy'}} as unknown as Request;
    const result = getRespondSettlementAgreementText(claim, req) as Record<string, string>;
    expect(result.claimant).toEqual('Claimant Co');
    expect(result.defendant).toEqual('Dave');
  });
});
