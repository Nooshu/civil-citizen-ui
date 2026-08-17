import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('claimFeePaymentSuccessfulSectionBuilder', () => {
  it('should add panel with payment reference', () => {
    const sections = new PaymentSuccessfulSectionBuilder()
      .addPanel('RC-CLAIM-1')
      .build();

    expect(sections[0].type).toBe(ClaimSummaryType.PANEL);
    expect(sections[0].data.html).toContain('RC-CLAIM-1');
  });

  it('should add claim fee summary', () => {
    const sections = new PaymentSuccessfulSectionBuilder()
      .addSummary('£25.00')
      .build();

    expect(sections[0].type).toBe(ClaimSummaryType.HTML);
    expect(sections[0].data.html).toContain('£25.00');
    expect(sections[0].data.html).toContain('COMMON.MICRO_TEXT.CLAIM_FEE');
  });
});
