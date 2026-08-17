import {
  getMediationCarmNextSteps,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/mediationConfirmationContentBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('mediationConfirmationContentBuilder', () => {
  it('should build mediation carm next steps', () => {
    const result = getMediationCarmNextSteps('en');
    expect(result).toHaveLength(5);
    expect(result[0].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1');
    expect(result[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
    expect(result[4].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_4');
  });
});
