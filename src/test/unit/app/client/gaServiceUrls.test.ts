import {
  GA_SERVICE_CASES_URL,
  GA_GET_APPLICATION_URL,
  GA_SERVICE_CASE_URL,
  GA_SERVICE_SUBMIT_EVENT,
  GA_FEES_PAYMENT_URL,
  GA_FEES_PAYMENT_STATUS_URL,
  GA_BY_CASE_URL,
} from '../../../../main/app/client/gaServiceUrls';

describe('gaServiceUrls', () => {
  it('should export base cases url', () => {
    expect(GA_SERVICE_CASES_URL).toBe('/cases/');
  });

  it('should build application urls from GA_SERVICE_CASES_URL', () => {
    expect(GA_GET_APPLICATION_URL).toBe('/cases/:caseId');
    expect(GA_SERVICE_SUBMIT_EVENT).toBe('/cases/:caseId/ga/citizen/:submitterId/event');
  });

  it('should export remaining GA service urls', () => {
    expect(GA_SERVICE_CASE_URL).toBe('/cases/:caseId');
    expect(GA_FEES_PAYMENT_URL).toBe('/fees/case/:claimId/ga/payment');
    expect(GA_FEES_PAYMENT_STATUS_URL).toBe('/fees/case/:claimId/ga/payment/:paymentReference/status');
    expect(GA_BY_CASE_URL).toBe('/cases/:id/ga/applications');
  });
});
