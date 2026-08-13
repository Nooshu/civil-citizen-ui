import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {YesNo} from 'form/models/yesNo';
import {Mediation} from 'models/mediation/mediation';
import {
  getRCDisputeNextSteps,
  getRCDisputeStatus,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/fullDefenceConfirmationContent';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';
const claimId = '5129';

function createDisputeClaim(): Claim {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.COMPANY;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Defendant'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  return claim;
}

describe('fullDefenceConfirmationContent', () => {
  it('should build RC dispute status', () => {
    const claim = createDisputeClaim();
    const result = getRCDisputeStatus(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_HAVE_MAILED');
  });

  it('should build next steps with mediation when defendant agreed', () => {
    const claim = createDisputeClaim();
    claim.mediation = {mediationDisagreement: {option: YesNo.YES}} as Mediation;
    const result = getRCDisputeNextSteps(claimId, claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.WE_WILL_CONTACT');
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_CLAIMANT_REJECTS')).toBe(true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.RC_DISPUTE.IF_THEY_REJECT')).toBe(true);
  });

  it('should build next steps without mediation ask when defendant rejected mediation', () => {
    const claim = createDisputeClaim();
    claim.mediation = {mediationDisagreement: {option: YesNo.NO}} as Mediation;
    const result = getRCDisputeNextSteps(claimId, claim, lang);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.IF_CLAIMANT_REJECTS_NO_MEDIATION')).toBe(true);
  });

  it('should build carm mediation paragraphs when carm applicable and small claim', () => {
    const claim = createDisputeClaim();
    claim.totalClaimAmount = 500;
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    const result = getRCDisputeNextSteps(claimId, claim, lang, true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION')).toBe(true);
    expect(result.some(s => s?.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2')).toBe(true);
  });
});
