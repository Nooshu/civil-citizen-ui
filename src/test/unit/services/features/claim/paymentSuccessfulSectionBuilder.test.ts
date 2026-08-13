import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('PaymentSuccessfulSectionBuilder', () => {
  it('should add panel with payment reference', () => {
    const sections = new PaymentSuccessfulSectionBuilder()
      .addPanel('RC-123', 'en')
      .build();

    expect(sections[0].type).toBe(ClaimSummaryType.PANEL);
    expect(sections[0].data.html).toContain('RC-123');
    expect(sections[0].data.title).toContain('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE');
  });

  it('should add summary with total amount and micro text', () => {
    const sections = new PaymentSuccessfulSectionBuilder()
      .addSummary('£10.00', 'COMMON.MICRO_TEXT.CLAIM_FEE', 'en')
      .build();

    expect(sections[0].type).toBe(ClaimSummaryType.HTML);
    expect(sections[0].data.html).toContain('£10.00');
    expect(sections[0].data.html).toContain('COMMON.MICRO_TEXT.CLAIM_FEE');
  });

  it('should add confirmation panel', () => {
    const sections = new PaymentSuccessfulSectionBuilder()
      .addPanelForConfirmation('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.APPLICATION_SUBMITTED', 'en')
      .build();

    expect(sections[0].type).toBe(ClaimSummaryType.PANEL);
    expect(sections[0].data.title).toContain('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.APPLICATION_SUBMITTED');
  });
});
