import {Claim} from 'models/claim';
import {
  getSendFinancialDetails,
} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/financialDetailsBuilder';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('financialDetailsBuilder', () => {
  it('should build send financial details content', () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC009';
    const result = getSendFinancialDetails(claim, 'en');
    expect(result.length).toBeGreaterThan(5);
    expect(result.some(s => s.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')).toBe(true);
    expect(result.some(s => s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SEND_FINANCIAL_DETAILS.TITLE')).toBe(true);
    expect(result.some(s => s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.USE_THIS_ADDRESS.TITLE')).toBe(true);
    expect(result.some(s => s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CAN_AFFORD.TITLE')).toBe(true);
    expect(result.some(s => s.data?.text === 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.COURT_BELIEVES_CANT_AFFORD.TITLE')).toBe(true);
  });
});
