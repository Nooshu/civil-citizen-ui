import {getMediationCarmParagraph} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/mediationCarmContent';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('mediationCarmContent', () => {
  it('should return mediation paragraphs when claimant has not rejected', () => {
    const result = getMediationCarmParagraph(lang);

    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1');
    expect(result[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
  });

  it('should return claimant rejects mediation paragraph when isClaimantReject is true', () => {
    const result = getMediationCarmParagraph(lang, 'Claimant Co', true);

    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION');
    expect(result[1].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2');
  });

  it('should default claimantName to empty string and isClaimantReject to false', () => {
    const result = getMediationCarmParagraph(lang, undefined as unknown as string, false);

    expect(result[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1');
  });
});
