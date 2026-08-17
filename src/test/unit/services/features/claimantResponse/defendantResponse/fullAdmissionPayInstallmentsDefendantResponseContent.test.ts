import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {FullAdmission} from 'models/fullAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {RepaymentPlan} from 'form/models/repaymentPlan';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {
  buildFullAdmissionInstallmentsResponseContent,
} from 'services/features/claimantResponse/defendantResponse/fullAdmissionPayInstallmentsDefendantResponseContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('fullAdmissionPayInstallmentsDefendantResponseContent', () => {
  it('should build installments response content with repayment plan', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.fullAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 100,
      repaymentFrequency: TransactionSchedule.MONTH,
      firstRepaymentDate: new Date('2035-01-01'),
    } as RepaymentPlan;

    const result = buildFullAdmissionInstallmentsResponseContent(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.DEFENDANT_ADMITS');
    expect(result[1].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.THEY_OFFERED_PAY');
    expect(result.length).toBeGreaterThan(2);
  });
});
