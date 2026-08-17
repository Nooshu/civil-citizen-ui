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
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {ResponseType} from 'form/models/responseType';
import {FullAdmission} from 'models/fullAdmission';
import {
  getPaymentText,
  getRespondToSettlementAgreementDeadline,
  getRespondentToImmediateSettlementAgreementDeadLine,
} from 'services/features/claimantResponse/signSettlmentAgreementService';

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

describe('signSettlmentAgreementService', () => {
  describe('getPaymentText', () => {
    it('should return pay by date text when court accepted claimant plan', () => {
      const claim = baseClaim();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentDate = {date: new Date('2035-06-01')} as never;
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.BY_SET_DATE);

      const result = getPaymentText(claim, createRequest()) as Record<string, string>;
      expect(result.paymentText).toEqual('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE');
      expect(result.claimant).toEqual('Claimant Co');
      expect(result.defendant).toEqual('Dave');
    });

    it('should return installments text when court accepted claimant plan', () => {
      const claim = baseClaim();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date('2035-01-01'),
      } as RepaymentPlan;
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.INSTALMENTS);

      const result = getPaymentText(claim, createRequest()) as Record<string, string>;
      expect(result.paymentText).toEqual('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT');
    });

    it('should return immediately text when court accepted claimant plan', () => {
      const claim = baseClaim();
      claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2035-06-01') as never;
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.IMMEDIATELY);

      const result = getPaymentText(claim, createRequest()) as Record<string, string>;
      expect(result.paymentText).toEqual('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.IMMEDIATE_PLAN');
    });

    it('should return pay by date text from defendant plan', () => {
      const claim = baseClaim();
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
      jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(true);
      jest.spyOn(claim, 'getPaymentDate').mockReturnValue(new Date('2035-06-01'));

      const result = getPaymentText(claim, createRequest()) as Record<string, string>;
      expect(result.paymentText).toEqual('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE');
    });

    it('should return installments text from defendant plan', () => {
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

      const result = getPaymentText(claim, createRequest()) as Record<string, string>;
      expect(result.paymentText).toEqual('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT');
    });
  });

  describe('getRespondToSettlementAgreementDeadline', () => {
    it('should return undefined when not signing settlement agreement', async () => {
      const claim = baseClaim();
      const result = await getRespondToSettlementAgreementDeadline({} as AppRequest, claim);
      expect(result).toBeUndefined();
    });

    it('should calculate immediate settlement deadline when court accepted immediate plan', async () => {
      const claim = baseClaim();
      claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement();
      claim.claimantResponse.signSettlementAgreement.signed = 'true';
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.IMMEDIATELY);
      const deadline = new Date('2035-06-10');
      jest.spyOn(CivilServiceClient.prototype, 'calculateExtendedResponseDeadline').mockResolvedValue(deadline);

      const result = await getRespondToSettlementAgreementDeadline({} as AppRequest, claim);
      expect(result).toEqual(deadline);
    });

    it('should calculate 7 day deadline for non-immediate settlement agreement', async () => {
      const claim = baseClaim();
      claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement();
      claim.claimantResponse.signSettlementAgreement.signed = 'true';
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
      const deadline = new Date('2035-06-20');
      const spy = jest.spyOn(CivilServiceClient.prototype, 'calculateExtendedResponseDeadline').mockResolvedValue(deadline);

      const result = await getRespondToSettlementAgreementDeadline({} as AppRequest, claim);
      expect(result).toEqual(deadline);
      expect(spy).toHaveBeenCalledWith(expect.any(Date), 7, expect.anything());
    });
  });

  describe('getRespondentToImmediateSettlementAgreementDeadLine', () => {
    it('should use same day when before 4pm', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2035-06-01T10:00:00'));
      const claim = baseClaim();
      const deadline = new Date('2035-06-06');
      const spy = jest.spyOn(CivilServiceClient.prototype, 'calculateExtendedResponseDeadline').mockResolvedValue(deadline);

      const result = await getRespondentToImmediateSettlementAgreementDeadLine({} as AppRequest, claim);
      expect(result).toEqual(deadline);
      expect(spy).toHaveBeenCalledWith(expect.any(Date), 5, expect.anything());
      jest.useRealTimers();
    });

    it('should add a day when after 4pm', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2035-06-01T17:00:00'));
      const claim = baseClaim();
      const deadline = new Date('2035-06-07');
      const spy = jest.spyOn(CivilServiceClient.prototype, 'calculateExtendedResponseDeadline').mockResolvedValue(deadline);
      spy.mockClear();

      await getRespondentToImmediateSettlementAgreementDeadLine({} as AppRequest, claim);
      const paymentDateArg = spy.mock.calls[0][0] as Date;
      expect(paymentDateArg.getDate()).toEqual(2);
      jest.useRealTimers();
    });
  });
});
