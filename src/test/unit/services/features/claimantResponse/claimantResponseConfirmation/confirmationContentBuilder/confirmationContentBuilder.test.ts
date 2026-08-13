import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {ClaimantResponse} from 'models/claimantResponse';
import {CaseState} from 'form/models/claimDetails';
import {YesNo} from 'form/models/yesNo';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {FullAdmission} from 'models/fullAdmission';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Mediation} from 'models/mediation/mediation';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildClaimantResponseSection,
  buildNextStepsSection,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/confirmationContentBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function baseClaim(): Claim {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.legacyCaseReference = '000MC009';
  claim.totalClaimAmount = 1000;
  claim.applicant1ResponseDate = new Date('2024-05-01');
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant'});
  claim.applicant1.type = PartyType.INDIVIDUAL;
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement();
  return claim;
}

describe('confirmationContentBuilder', () => {
  describe('buildClaimantResponseSection', () => {
    it('should show not proceed with claim title', () => {
      const claim = baseClaim();
      claim.claimantResponse.intentionToProceed = {option: YesNo.NO};
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      const result = buildClaimantResponseSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM');
    });

    it('should show sign settlement agreement title', () => {
      const claim = baseClaim();
      claim.claimantResponse.signSettlementAgreement.signed = 'true';
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
      const result = buildClaimantResponseSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE');
    });

    it('should show accepted defendant response for part admit accepted', () => {
      const claim = baseClaim();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      const result = buildClaimantResponseSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.ACCEPTED_DEFENDANT_RESPONSE');
    });

    it('should show CCJ requested title', () => {
      const claim = baseClaim();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: YesNo.YES};
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildClaimantResponseSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_REQUESTED');
    });

    it('should show rejected payment plan message for business', () => {
      const claim = baseClaim();
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: YesNo.NO};
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildClaimantResponseSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_PAYMENT_PLAN.MESSAGE');
    });
  });

  describe('buildNextStepsSection', () => {
    it('should return minti tracks next steps when minti applicable and claimant not settled', () => {
      const claim = baseClaim();
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);
      const result = buildNextStepsSection(claim, lang, false, true);
      expect(result[0].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MINTI.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    });

    it('should return carm mediation next steps', () => {
      const claim = baseClaim();
      claim.totalClaimAmount = 500;
      jest.spyOn(claim, 'hasClaimantNotSettled').mockReturnValue(true);
      jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
      const result = buildNextStepsSection(claim, lang, true, false);
      expect(result[0].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    });

    it('should return financial details for business rejecting payment plan', () => {
      const claim = baseClaim();
      claim.respondent1.type = PartyType.COMPANY;
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: YesNo.NO};
      jest.spyOn(claim, 'isClaimantRejectedPaymentPlan').mockReturnValue(true);
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result.some(s => s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.TITLE')).toBe(true);
    });

    it('should return dispute not continue next steps', () => {
      const claim = baseClaim();
      claim.claimantResponse.intentionToProceed = {option: YesNo.NO};
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      expect(claim.responseStatus).toEqual(ClaimResponseStatus.RC_DISPUTE);
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED');
    });

    it('should return PA pay immediately accepted next steps', () => {
      const claim = baseClaim();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
      claim.applicant1AcceptAdmitAmountPaidSpec = 'Yes' as never;
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      claim.respondentPaymentDeadline = new Date('2035-06-01');
      expect(claim.responseStatus).toEqual(ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY_ACCEPTED);
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.DEFENDANT_TO_PAY_YOU_IMMEDIATELY');
    });

    it('should return settle claim next steps', () => {
      const claim = baseClaim();
      jest.spyOn(claim, 'hasClaimantAcceptedToSettleClaim').mockReturnValue(true);
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result.some(s =>
        s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.ACCEPTED_DEFENDANT_RESPONSE_TO_SETTLE.CLAIM_SETTLE'
        || s.data?.html?.toString().includes('CLAIM_SETTLE'),
      )).toBe(true);
    });

    it('should return no mediation next steps when rejected and mediation declined', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      claim.claimantResponse.intentionToProceed = {option: YesNo.YES};
      claim.claimantResponse.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
      claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
    });

    it('should return yes mediation next steps when in mediation state', () => {
      const claim = baseClaim();
      claim.ccdState = CaseState.IN_MEDIATION;
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    });

    it('should return yes mediation when claimant agreed mediation after rejection', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      claim.claimantResponse.intentionToProceed = {option: YesNo.YES};
      claim.claimantResponse.mediation = {canWeUse: {option: YesNo.YES}} as Mediation;
      jest.spyOn(Object.assign(new ClaimantResponse(), claim.claimantResponse), 'hasClaimantAgreedToMediation');
      claim.claimantResponse.hasClaimantAgreedToMediation = () => true;
      claim.claimantResponse.hasClaimantNotAgreedToMediation = () => false;
      jest.spyOn(claim, 'hasRespondent1NotAgreedMediation').mockReturnValue(false);
      jest.spyOn(claim, 'isFastTrackClaim', 'get').mockReturnValue(false);
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    });

    it('should return CCJ next steps when payment plan accepted and CCJ requested', () => {
      const claim = baseClaim();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {option: YesNo.YES};
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildNextStepsSection(claim, lang, false, false);
      expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG1');
    });

    it('should return sign settlement agreement next steps', () => {
      const claim = baseClaim();
      claim.claimantResponse.signSettlementAgreement.signed = 'true';
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildNextStepsSection(claim, lang, false, false, new Date('2035-07-01'));
      expect(result.some(s =>
        s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WHAT_HAPPENS_NEXT'
        || s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.WE_EMAILED',
      )).toBe(true);
    });
  });
});
