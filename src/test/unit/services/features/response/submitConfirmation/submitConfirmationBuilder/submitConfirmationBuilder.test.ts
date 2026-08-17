import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {FullAdmission} from 'models/fullAdmission';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {YesNo} from 'form/models/yesNo';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildNextStepsSection,
  buildSubmitStatus,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';
const claimId = '5129';

function baseClaim(): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.COMPANY;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Defendant'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  return claim;
}

describe('submitConfirmationBuilder', () => {
  describe('buildSubmitStatus', () => {
    it('should return FA pay immediately status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(claim.responseStatus).toEqual(ClaimResponseStatus.FA_PAY_IMMEDIATELY);
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should return FA pay by date status with contact and financial details for business', () => {
      const claim = baseClaim();
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildSubmitStatus(claimId, claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_DATE.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
      expect(result.some(s => s.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU')).toBe(true);
      expect(result.some(s => s.data?.text === 'PAGES.SUBMIT_CONFIRMATION.SEND_FINANCIAL_DETAILS')).toBe(true);
    });

    it('should return FA pay installments status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.FA_PAY_BY_INSTALLMENTS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should return RC dispute status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_HAVE_MAILED');
    });

    it('should return PA already paid status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.YES};
      claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 100, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should return PA not paid pay immediately status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      const result = buildSubmitStatus(claimId, claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW');
      expect(result.some(s => s.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_CONTACT_YOU')).toBe(true);
    });

    it('should return PA not paid pay by date status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE');
    });

    it('should return PA not paid pay installments status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE');
    });

    it('should return RC paid less status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 200, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });

    it('should return RC paid full status', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 1000, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      expect(buildSubmitStatus(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    });
  });

  describe('buildNextStepsSection', () => {
    it('should return FA pay immediately next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.FA_PAY_IMMEDIATELY.MAKE_SURE_THAT');
    });

    it('should return FA pay by date next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result[0].data?.text).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
    });

    it('should return FA pay installments next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result[1].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.SETUP_REPAYMENT_PLAN');
    });

    it('should return RC dispute next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT');
    });

    it('should return PA already paid next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.YES};
      claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 100, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
    });

    it('should return PA pay immediately next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      const result = buildNextStepsSection(claimId, claim, lang);
      expect(result.some(s => s?.data?.text?.toString().includes('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY'))).toBe(true);
    });

    it('should return PA pay by date next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.partialAdmission.paymentIntention.paymentDate = new Date('2035-06-01');
      expect(buildNextStepsSection(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
    });

    it('should return PA pay installments next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {option: YesNo.NO};
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(buildNextStepsSection(claimId, claim, lang)[0].data?.text)
        .toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
    });

    it('should return RC paid less next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 200, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      expect(buildNextStepsSection(claimId, claim, lang)[0].data?.html)
        .toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
    });

    it('should return RC paid full next steps', () => {
      const claim = baseClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
      claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 1000, date: new Date(), day: '1', month: '1', year: '2024', text: 'Cash',
      });
      expect(buildNextStepsSection(claimId, claim, lang)[0].data?.html)
        .toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
    });
  });
});
