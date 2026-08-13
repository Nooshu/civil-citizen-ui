import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {
  getClaimantResponseStatus,
  getRCDisputeNotContinueNextSteps,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/disputeConfirmationContentBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('disputeConfirmationContentBuilder', () => {
  it('should build claimant response status panel', () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC009';
    claim.applicant1ResponseDate = new Date('2024-05-01');
    const result = getClaimantResponseStatus(claim, 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM', lang);
    expect(result[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM');
    expect(result[0].data?.html).toContain('000MC009');
  });

  it('should build not continue next steps', () => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    const result = getRCDisputeNotContinueNextSteps(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED');
  });
});
