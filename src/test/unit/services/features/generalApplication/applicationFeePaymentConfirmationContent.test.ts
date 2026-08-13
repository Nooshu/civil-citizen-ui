import {Claim} from 'models/claim';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getGaPaymentSuccessfulBodyContent,
  getGaPaymentSuccessfulButtonContent,
  getGaPaymentSuccessfulPanelContent,
} from 'services/features/generalApplication/applicationFeePaymentConfirmationContent';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('applicationFeePaymentConfirmationContent', () => {
  const claim = new Claim();

  it('should build without-fee confirmation panel', () => {
    const content = getGaPaymentSuccessfulPanelContent(claim, true, false, 'en');
    expect(content[0].data.title).toContain('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.APPLICATION_SUBMITTED');
  });

  it('should build payment panel with payment reference', () => {
    const appResponse = {
      case_data: {
        generalAppPBADetails: {
          paymentDetails: {reference: 'RC-GA-1'},
          additionalPaymentDetails: {reference: 'RC-GA-ADD'},
        },
      },
    } as ApplicationResponse;

    const content = getGaPaymentSuccessfulPanelContent(claim, false, false, 'en', appResponse);
    expect(content[0].data.html).toContain('RC-GA-1');

    const additional = getGaPaymentSuccessfulPanelContent(claim, false, true, 'en', appResponse);
    expect(additional[0].data.html).toContain('RC-GA-ADD');
  });

  it('should build body content for standard fee payment', () => {
    const content = getGaPaymentSuccessfulBodyContent(claim, '1000', false, false, false, 'en');
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_1')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY')).toBe(true);
  });

  it('should build body content for without fee and sync warning', () => {
    const content = getGaPaymentSuccessfulBodyContent(claim, '0', false, true, true, 'en');
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.ACCOUNT_NOT_UPDATED')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_5')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY')).toBe(false);
  });

  it('should build body content for additional fee', () => {
    const content = getGaPaymentSuccessfulBodyContent(claim, '500', true, false, false, 'en');
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_6')).toBe(true);
    expect(JSON.stringify(content)).toContain('COMMON.MICRO_TEXT.ADDITIONAL_APPLICATION_FEE');
  });

  it('should build button content', () => {
    const content = getGaPaymentSuccessfulButtonContent('/dashboard');
    expect(content[0].data.text).toBe('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD');
    expect(content[0].data.href).toBe('/dashboard');
  });
});
