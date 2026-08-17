import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {getClaimSettleNextSteps} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/claimSettleConfirmationBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('claimSettleConfirmationBuilder', () => {
  it('should build claim settle next steps with defendant name', () => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({
      title: 'Mr',
      firstName: 'Dave',
      lastName: 'Defendant',
    });
    claim.respondent1.type = PartyType.INDIVIDUAL;

    const result = getClaimSettleNextSteps(claim, lang);

    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(result[0].data?.variables).toEqual({lng: lang});
    expect(result[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.ACCEPTED_DEFENDANT_RESPONSE_TO_SETTLE.CLAIM_SETTLE');
    expect(result[1].data?.variables).toEqual({defendantName: 'Mr Dave Defendant', lng: lang});
  });
});
