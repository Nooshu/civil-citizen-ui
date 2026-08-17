import {PaymentInformation} from 'models/feePayment/paymentInformation';

describe('PaymentInformation', () => {
  it('should assign all payment fields', () => {
    const info = new PaymentInformation(
      'ext-ref',
      'pay-ref',
      'Success',
      'https://next.example',
      '2024-01-01',
      'P001',
      'Payment failed',
    );

    expect(info.externalReference).toBe('ext-ref');
    expect(info.paymentReference).toBe('pay-ref');
    expect(info.status).toBe('Success');
    expect(info.nextUrl).toBe('https://next.example');
    expect(info.dateCreated).toBe('2024-01-01');
    expect(info.errorCode).toBe('P001');
    expect(info.errorDescription).toBe('Payment failed');
  });

  it('should allow empty construction', () => {
    const info = new PaymentInformation();

    expect(info.externalReference).toBeUndefined();
    expect(info.paymentReference).toBeUndefined();
    expect(info.status).toBeUndefined();
    expect(info.nextUrl).toBeUndefined();
    expect(info.dateCreated).toBeUndefined();
    expect(info.errorCode).toBeUndefined();
    expect(info.errorDescription).toBeUndefined();
  });
});
