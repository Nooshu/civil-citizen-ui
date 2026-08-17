import {Claim} from 'models/claim';
import {ClaimFeeData} from 'form/models/claimDetails';
import {
  getPaymentSuccessfulBodyContent,
  getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('claimFeePaymentConfirmationContent', () => {
  const claim = new Claim();
  claim.claimDetails = {
    claimFeePayment: {paymentReference: 'RC-999'},
  } as Claim['claimDetails'];
  claim.claimFee = {calculatedAmountInPence: '2500'} as ClaimFeeData;

  it('should build panel content', () => {
    const content = getPaymentSuccessfulPanelContent(claim, 'en');
    expect(content[0].data.html).toContain('RC-999');
  });

  it('should build body content with confirmation and summary', () => {
    const content = getPaymentSuccessfulBodyContent(claim, 'en');
    expect(content.some(s => s.data?.text === 'PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.CONFIRMATION')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_SUMMARY')).toBe(true);
    expect(JSON.stringify(content)).toContain('£25');
  });

  it('should build button content', () => {
    const content = getPaymentSuccessfulButtonContent('/dashboard');
    expect(content[0].data.text).toBe('COMMON.BUTTONS.GO_TO_ACCOUNT');
    expect(content[0].data.href).toBe('/dashboard');
  });
});
