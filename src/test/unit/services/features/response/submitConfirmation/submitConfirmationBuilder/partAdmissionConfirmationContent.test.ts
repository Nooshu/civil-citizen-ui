import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {YesNo} from 'form/models/yesNo';
import {Mediation} from 'models/mediation/mediation';
import {
  getPA_AlreadyPaidNextSteps,
  getPA_AlreadyPaidStatus,
  getPAPayByDateNextSteps,
  getPAPayByDateStatus,
  getPAPayImmediatelyNextSteps,
  getPAPayImmediatelyStatus,
  getPAPayInstallmentsNextSteps,
  getPAPayInstallmentsStatus,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/partAdmissionConfirmationContent';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';
const claimId = '5129';

function createPartAdmitClaim(paymentOption?: PaymentOptionType, alreadyPaid = false): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.COMPANY;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Defendant'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {option: alreadyPaid ? YesNo.YES : YesNo.NO};
  if (alreadyPaid) {
    claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
      amount: 250.5,
      date: new Date('2024-01-01'),
      day: '1',
      month: '1',
      year: '2024',
      text: 'Cash',
    });
  } else {
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(300, 1000);
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
    claim.partialAdmission.paymentIntention.paymentDate = new Date('2035-06-01T00:00:00.000Z');
  }
  return claim;
}

describe('partAdmissionConfirmationContent', () => {
  it('should build already paid status', () => {
    const claim = createPartAdmitClaim(undefined, true);
    const result = getPA_AlreadyPaidStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.PA_ALREADY_PAID.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    expect(result[0].data?.variables).toEqual(expect.objectContaining({amount: '250.50'}));
  });

  it('should build already paid next steps with mediation', () => {
    const claim = createPartAdmitClaim(undefined, true);
    const result = getPA_AlreadyPaidNextSteps(claim, lang);
    expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_ASK_MEDIATION')).toBe(true);
  });

  it('should build already paid next steps with carm', () => {
    const claim = createPartAdmitClaim(undefined, true);
    claim.totalClaimAmount = 500;
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const result = getPA_AlreadyPaidNextSteps(claim, lang, true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1')).toBe(true);
  });

  it('should build already paid next steps when mediation rejected', () => {
    const claim = createPartAdmitClaim(undefined, true);
    claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
    const result = getPA_AlreadyPaidNextSteps(claim, lang);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE_HEARING')).toBe(true);
  });

  it('should build pay immediately status and next steps', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
    expect(getPAPayImmediatelyStatus(claim, lang)[0].data?.text)
      .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.YOU_HAVE_SAID_YOU_OWW');
    const next = getPAPayImmediatelyNextSteps(claimId, claim, lang);
    expect(next.some(s => s?.data?.text?.toString().includes('PAGES.SUBMIT_CONFIRMATION.PA_PAY_IMMEDIATELY.IF_CLAIMANT_ACCEPTS_OFFER_OF'))).toBe(true);
  });

  it('should build pay by date status and next steps', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
    expect(getPAPayByDateStatus(claim, lang)[0].data?.text)
      .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_BY_DATE.YOU_BELIEVE_YOU_OWE');
    const next = getPAPayByDateNextSteps(claimId, claim, lang);
    expect(next[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
  });

  it('should build pay installments status and next steps', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.INSTALMENTS);
    expect(getPAPayInstallmentsStatus(claim, lang)[0].data?.text)
      .toEqual('PAGES.SUBMIT_CONFIRMATION.PA_PAY_INSTALLMENTS.YOU_BELIEVE_YOU_OWE');
    const next = getPAPayInstallmentsNextSteps(claimId, claim, lang);
    expect(next[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_OFFER');
  });

  it('should build pay installments next steps with carm', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.INSTALMENTS);
    claim.totalClaimAmount = 500;
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const next = getPAPayInstallmentsNextSteps(claimId, claim, lang, true);
    expect(next.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1')).toBe(true);
  });

  it('should build pay by date next steps when mediation rejected', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
    claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
    const next = getPAPayByDateNextSteps(claimId, claim, lang);
    expect(next.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE')).toBe(true);
  });

  it('should build pay immediately next steps with carm', () => {
    const claim = createPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
    claim.totalClaimAmount = 500;
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const next = getPAPayImmediatelyNextSteps(claimId, claim, lang, true);
    expect(next.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1')).toBe(true);
  });
});
