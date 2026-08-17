import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {
  getCCJNextSteps,
  getCCJNextStepsForJudgeDecideRepaymentPlan,
  getCCJNextStepsForRejectedRepaymentPlan,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/ccjConfirmationBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function createClaim(): Claim {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  return claim;
}

describe('ccjConfirmationBuilder', () => {
  it('should build CCJ next steps', () => {
    const result = getCCJNextSteps(createClaim(), lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG1');
    expect(result[2].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2');
  });

  it('should build rejected repayment plan next steps', () => {
    const result = getCCJNextStepsForRejectedRepaymentPlan(createClaim(), lang);
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3');
  });

  it('should build judge decide repayment plan next steps', () => {
    const result = getCCJNextStepsForJudgeDecideRepaymentPlan(createClaim(), lang);
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG4');
    expect(result[3].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG5');
    expect(result[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG6');
  });
});
