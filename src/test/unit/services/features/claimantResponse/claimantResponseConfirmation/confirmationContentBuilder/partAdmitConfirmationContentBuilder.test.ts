import {Claim} from 'models/claim';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {
  getPAPayImmediatelyAcceptedNextSteps,
  getRejectedResponseMintiTracksNextSteps,
  getRejectedResponseNoMediationNextSteps,
  getRejectedResponseYesMediationNextSteps,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/partAdmitConfirmationContentBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('partAdmitConfirmationContentBuilder', () => {
  it('should build PA pay immediately accepted next steps', () => {
    const claim = new Claim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(250.5, 1000);
    claim.respondentPaymentDeadline = new Date('2035-06-01');
    const result = getPAPayImmediatelyAcceptedNextSteps(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.DEFENDANT_TO_PAY_YOU_IMMEDIATELY');
    expect(result[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PA_PAY_IMMEDIATELY.TELL_US_SETTLEMENT');
  });

  it('should build rejected response no mediation next steps', () => {
    const result = getRejectedResponseNoMediationNextSteps(lang);
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.NO_MEDIATION.WHAT_HAPPENS_NEXT_TEXT');
  });

  it('should build rejected response minti tracks next steps', () => {
    const result = getRejectedResponseMintiTracksNextSteps(lang);
    expect(result[0].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MINTI.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(result[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.MINTI.REVIEW_CASE');
  });

  it('should build rejected response yes mediation next steps', () => {
    const result = getRejectedResponseYesMediationNextSteps(lang);
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(result[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.REJECTED_DEFENDANT_RESPONSE.YES_MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2');
  });
});
