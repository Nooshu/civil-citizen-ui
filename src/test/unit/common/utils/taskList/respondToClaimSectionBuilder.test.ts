import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {PartialAdmission} from 'common/models/partialAdmission';
import {Party} from 'common/models/party';
import {FullAdmission} from 'common/models/fullAdmission';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  buildRespondToClaimTasks,
  isRejectAllAndCounterClaim,
} from 'common/utils/taskList/respondToClaimSectionBuilder';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN_FULL_URL,
  CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  FINANCIAL_DETAILS_URL,
  RESPONSE_YOUR_DEFENCE_URL,
} from 'routes/urls';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('respondToClaimSectionBuilder', () => {
  const claimId = '5129';
  const lang = 'en';
  const chooseAResponseUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const decideHowYouPayUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  const shareFinancialDetailsUrl = constructResponseUrlWithIdParams(claimId, FINANCIAL_DETAILS_URL);
  const repaymentFAPlanUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_FULL_URL);
  const repaymentPAPlanUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_PARTIAL_URL);
  const howMuchHaveYouPaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  const howMuchMoneyAdmitOweUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);
  const whenWillYouPayUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
  const whyDisagreeWithAmountClaimedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);
  const whyDisagreeFullDefenceUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL);
  const tellUsHowMuchYouHavePaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FR_AMOUNT_YOU_PAID_URL);
  const tellUsWhyDisagreeWithClaimUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_YOUR_DEFENCE_URL);

  describe('isRejectAllAndCounterClaim', () => {
    it('should return true when reject all option is counter claim', () => {
      const claim = new Claim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.COUNTER_CLAIM);
      expect(isRejectAllAndCounterClaim(claim)).toBe(true);
    });

    it('should return false when reject all option is not counter claim', () => {
      const claim = new Claim();
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
      expect(isRejectAllAndCounterClaim(claim)).toBe(false);
    });

    it('should return false when reject all is missing', () => {
      expect(isRejectAllAndCounterClaim(new Claim())).toBe(false);
    });
  });

  describe('buildRespondToClaimTasks', () => {
    it('should return only chooseAResponse when response type is incomplete', () => {
      const tasks = buildRespondToClaimTasks(new Claim(), claimId, lang);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].url).toEqual(chooseAResponseUrl);
      expect(tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    it('should mark chooseAResponse incomplete for counter claim even when response type set', () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.COUNTER_CLAIM);

      const tasks = buildRespondToClaimTasks(claim, claimId, lang);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].url).toEqual(chooseAResponseUrl);
      expect(tasks[0].status).toEqual(TaskStatus.INCOMPLETE);
    });

    describe('FULL_ADMISSION', () => {
      it('should include decideHowYouPay when full admission selected', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks).toHaveLength(2);
        expect(tasks[0].url).toEqual(chooseAResponseUrl);
        expect(tasks[1].url).toEqual(decideHowYouPayUrl);
      });

      it('should add shareFinancialDetails when decideHowYouPay complete and not pay immediately', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.fullAdmission = new FullAdmission();
        claim.fullAdmission.paymentIntention = new PaymentIntention();
        claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
        claim.fullAdmission.paymentIntention.paymentDate = new Date();

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks).toHaveLength(3);
        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          decideHowYouPayUrl,
          shareFinancialDetailsUrl,
        ]);
      });

      it('should add repaymentPlan when full admission instalments', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.fullAdmission = new FullAdmission();
        claim.fullAdmission.paymentIntention = new PaymentIntention();
        claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
        claim.fullAdmission.paymentIntention.repaymentPlan = {
          paymentAmount: 100,
          repaymentFrequency: 'MONTH',
          firstRepaymentDate: new Date(),
        };

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks).toHaveLength(4);
        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          decideHowYouPayUrl,
          shareFinancialDetailsUrl,
          repaymentFAPlanUrl,
        ]);
      });

      it('should not add financial details when paying immediately', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
        claim.fullAdmission = new FullAdmission();
        claim.fullAdmission.paymentIntention = new PaymentIntention();
        claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks).toHaveLength(2);
        expect(tasks.map(t => t.url)).toEqual([chooseAResponseUrl, decideHowYouPayUrl]);
      });
    });

    describe('PART_ADMISSION', () => {
      it('should include whyDisagree when part admission with no alreadyPaid answer', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks).toHaveLength(2);
        expect(tasks[0].url).toEqual(chooseAResponseUrl);
        expect(tasks[1].url).toEqual(whyDisagreeWithAmountClaimedUrl);
      });

      it('should include howMuchHaveYouPaid when already paid', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.YES);

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          howMuchHaveYouPaidUrl,
          whyDisagreeWithAmountClaimedUrl,
        ]);
      });

      it('should include howMuchMoneyAdmitOwe and whenWillYouPay when not paid and amount owed set', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);
        claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
        claim.partialAdmission.howMuchDoYouOwe.amount = 1;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          howMuchMoneyAdmitOweUrl,
          whyDisagreeWithAmountClaimedUrl,
          whenWillYouPayUrl,
        ]);
      });

      it('should include howMuchMoneyAdmitOwe only when not paid and amount owed missing', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          howMuchMoneyAdmitOweUrl,
          whyDisagreeWithAmountClaimedUrl,
        ]);
      });

      it('should add shareFinancialDetails for by set date payment intention', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
        claim.partialAdmission.paymentIntention.paymentDate = new Date();

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          shareFinancialDetailsUrl,
          whyDisagreeWithAmountClaimedUrl,
        ]);
      });

      it('should add shareFinancialDetails and repaymentPlan for instalments', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.PART_ADMISSION;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          shareFinancialDetailsUrl,
          whyDisagreeWithAmountClaimedUrl,
          repaymentPAPlanUrl,
        ]);
      });
    });

    describe('FULL_DEFENCE', () => {
      it('should include tellUsHowMuchYouHavePaid when already paid', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
        claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          tellUsHowMuchYouHavePaidUrl,
        ]);
      });

      it('should include whyDisagree when already paid amount is less than claim total', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
        claim.totalClaimAmount = 1000;
        claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
        claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
        claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 500;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          tellUsHowMuchYouHavePaidUrl,
          whyDisagreeFullDefenceUrl,
        ]);
      });

      it('should not include whyDisagree when already paid amount is not less than claim total', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
        claim.totalClaimAmount = 1000;
        claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
        claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
        claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 1000;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          tellUsHowMuchYouHavePaidUrl,
        ]);
      });

      it('should include tellUsWhyDisagreeWithClaim when dispute', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
        claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([
          chooseAResponseUrl,
          tellUsWhyDisagreeWithClaimUrl,
        ]);
      });

      it('should only include chooseAResponse when full defence without paid or dispute option', () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.responseType = ResponseType.FULL_DEFENCE;

        const tasks = buildRespondToClaimTasks(claim, claimId, lang);

        expect(tasks.map(t => t.url)).toEqual([chooseAResponseUrl]);
      });
    });
  });
});
