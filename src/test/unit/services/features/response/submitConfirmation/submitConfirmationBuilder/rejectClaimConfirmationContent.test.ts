import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {YesNo} from 'form/models/yesNo';
import {Mediation} from 'models/mediation/mediation';
import {
  getRC_PaidFullNextSteps,
  getRC_PaidFullStatus,
  getRC_PaidLessNextSteps,
  getRC_PaidLessStatus,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/rejectClaimConfirmationContent';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function createPaidClaim(amount: number, total = 1000): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = total;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.COMPANY;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Defendant'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  claim.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
  claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
    amount,
    date: new Date('2024-01-01'),
    day: '1',
    month: '1',
    year: '2024',
    text: 'Bank transfer',
  });
  return claim;
}

describe('rejectClaimConfirmationContent', () => {
  it('should build paid less status', () => {
    const claim = createPaidClaim(200, 1000);
    const result = getRC_PaidLessStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
    expect(result[0].data?.variables).toEqual(expect.objectContaining({amount: 200}));
  });

  it('should build paid full status', () => {
    const claim = createPaidClaim(1000, 1000);
    const result = getRC_PaidFullStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.WE_EMAILED_CLAIMANT_YOUR_INTENTION');
  });

  it('should build paid less next steps with mediation', () => {
    const claim = createPaidClaim(200, 1000);
    const result = getRC_PaidLessNextSteps(claim, lang);
    expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_ACCEPTS_RESPONSE');
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.RC_PAY_LESS.WE_ASK_CLAIMANT_FOR_MEDIATION')).toBe(true);
  });

  it('should build paid less next steps without mediation when rejected', () => {
    const claim = createPaidClaim(200, 1000);
    claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
    const result = getRC_PaidLessNextSteps(claim, lang);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.THE_COURT_WILL_REVIEW_CASE_HEARING')).toBe(true);
  });

  it('should build paid less next steps with carm', () => {
    const claim = createPaidClaim(200, 500);
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const result = getRC_PaidLessNextSteps(claim, lang, true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1')).toBe(true);
  });

  it('should build paid full next steps with mediation', () => {
    const claim = createPaidClaim(1000, 1000);
    const result = getRC_PaidFullNextSteps(claim, lang);
    expect(result[0].data?.html).toContain('PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_ACCEPTS_CLAIM_WILL_END');
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.RC_PAY_FULL.IF_CLAIMANT_REJECTS_TRY_MEDIATION')).toBe(true);
  });

  it('should build paid full next steps without mediation when rejected', () => {
    const claim = createPaidClaim(1000, 1000);
    claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
    const result = getRC_PaidFullNextSteps(claim, lang);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_NO_MEDIATION')).toBe(true);
  });

  it('should build paid full next steps with carm', () => {
    const claim = createPaidClaim(500, 500);
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const result = getRC_PaidFullNextSteps(claim, lang, true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION')).toBe(true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2')).toBe(true);
  });
});
