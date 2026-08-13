import {getRedirectUrlCommon} from 'services/features/caseProgression/hearingFee/paymentServiceUtils';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Hearing} from 'models/caseProgression/hearing';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  HEARING_FEE_PAYMENT_CONFIRMATION_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-key'),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
}));
jest.mock('services/features/feePayment/feePaymentService', () => ({
  getFeePaymentRedirectInformation: jest.fn(),
  getFeePaymentStatus: jest.fn(),
}));
jest.mock('modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as feePaymentService from 'services/features/feePayment/feePaymentService';
import * as caseProgressionService from 'services/features/caseProgression/caseProgressionService';
import * as paymentSessionStoreService from 'modules/draft-store/paymentSessionStoreService';
import * as utilityService from 'modules/utilityService';

describe('paymentServiceUtils getRedirectUrlCommon', () => {
  const claimId = '1';
  const req = {
    session: {user: {id: 'user-1'}},
    params: {id: claimId},
  } as unknown as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to apply help fee selection when no payment information', async () => {
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    (feePaymentService.getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(null);

    const url = await getRedirectUrlCommon(claimId, req);
    expect(url).toBe(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
  });

  it('should redirect to confirmation when payment status is Success', async () => {
    const paymentInfo = {
      paymentReference: 'RC-1',
      nextUrl: 'https://gov.pay/next',
    } as PaymentInformation;
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.hearing = new Hearing();
    claim.caseProgression.hearing.paymentInformation = paymentInfo;

    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (feePaymentService.getFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Success'});

    const url = await getRedirectUrlCommon(claimId, req);

    expect(caseProgressionService.saveCaseProgression).toHaveBeenCalled();
    expect(paymentSessionStoreService.saveUserId).toHaveBeenCalled();
    expect(url).toBe(constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CONFIRMATION_URL));
  });

  it('should request new payment info when status is Failed', async () => {
    const paymentInfo = {
      paymentReference: 'RC-1',
      nextUrl: 'https://gov.pay/old',
    } as PaymentInformation;
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.hearing = new Hearing();
    claim.caseProgression.hearing.paymentInformation = paymentInfo;
    const newPayment = {paymentReference: 'RC-2', nextUrl: 'https://gov.pay/new'} as PaymentInformation;

    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (feePaymentService.getFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Failed'});
    (feePaymentService.getFeePaymentRedirectInformation as jest.Mock).mockResolvedValue(newPayment);

    const url = await getRedirectUrlCommon(claimId, req);
    expect(url).toBe('https://gov.pay/new');
  });

  it('should return existing nextUrl for in-progress payment', async () => {
    const paymentInfo = {
      paymentReference: 'RC-1',
      nextUrl: 'https://gov.pay/pending',
    } as PaymentInformation;
    const claim = new Claim();
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.hearing = new Hearing();
    claim.caseProgression.hearing.paymentInformation = paymentInfo;

    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (feePaymentService.getFeePaymentStatus as jest.Mock).mockResolvedValue({status: 'Initiated'});

    const url = await getRedirectUrlCommon(claimId, req);
    expect(url).toBe('https://gov.pay/pending');
  });

  it('should mark paymentSyncError and return null redirect info on fetch error then fall back', async () => {
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    (feePaymentService.getFeePaymentRedirectInformation as jest.Mock).mockRejectedValue(new Error('boom'));
    (utilityService.getClaimById as jest.Mock).mockResolvedValue(new Claim());

    const url = await getRedirectUrlCommon(claimId, req);
    expect(draftStoreService.saveDraftClaim).toHaveBeenCalled();
    expect(url).toBe(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
  });
});
