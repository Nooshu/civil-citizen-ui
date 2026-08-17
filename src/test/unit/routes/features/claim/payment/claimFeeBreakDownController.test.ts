import request from 'supertest';
import express from 'express';
import {app} from '../../../../../../main/app';
import claimFeeBreakDownController from 'routes/features/claim/payment/claimFeeBreakDownController';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {getClaimBusinessProcess, getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import nock from 'nock';
import config from 'config';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Session} from 'express-session';
import * as feePaymentServiceModule from 'services/features/feePayment/feePaymentService';

const civilServiceUrl = config.get<string>('services.civilService.url');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
  getClaimBusinessProcess: jest.fn(),
}));
jest.mock('routes/guards/claimFeePaymentGuard', () => ({
  claimFeePaymentGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('../../../../../../main/modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
  getUserId: jest.fn(),
  saveOriginalPaymentConfirmationUrl: jest.fn(),
  getPaymentConfirmationUrl: jest.fn(),
  deleteUserId: jest.fn(),
  deletePaymentConfirmationUrl: jest.fn(),
}));

describe('on GET', () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = {user: {id: 'user-id'}} as unknown as Session;
    res.render = jest.fn((view, options) => res.status(200).send(options));
    next();
  });
  app.use(claimFeeBreakDownController);

  beforeEach(() => {
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .reply(200, '100');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '100');
  });

  it('should handle the get call of fee summary details', async () => {
    //given
    const claimId = '111111';
    const mockClaimData = {
      totalClaimAmount: 1000,
      interest: {
        interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST,
        totalInterest: { amount: 100 },
      },
      claimInterest: 'yes' ,
      claimFee: {
        calculatedAmountInPence: 10000,
      },
      isInterestFromASpecificDate: () => false,
      hasBusinessProcessFinished: () => false,
      hasInterest:() => true,
    };
    const mockClaimFee = 100;
    const mockTotalAmount = 1200;
    (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaimData);

    const mockBusinessProcessData = {
      hasBusinessProcessFinished: () => true,
    };
    (getClaimBusinessProcess as jest.Mock).mockResolvedValueOnce(mockBusinessProcessData);
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          totalClaimAmount: mockClaimData.totalClaimAmount.toFixed(2),
          interest: mockClaimData.interest.totalInterest.amount,
          claimFee: mockClaimFee,
          paymentSyncError: false,
          hasInterest: true,
          pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
          totalAmount: mockTotalAmount.toFixed(2),
          hasBusinessProcessFinished: true,
        });
      });
  });

  it('should handle the get call of fee summary details when business process has not finished', async () => {
    //given
    const claimId = '111111';
    const mockClaimData = {
      totalClaimAmount: 1000,
      interest: {
        interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST,
        totalInterest: { amount: 100 },
      },
      claimInterest: 'yes' ,
      claimFee: {
        calculatedAmountInPence: 10000,
      },
      hasBusinessProcessFinished: () => false,
      isInterestFromASpecificDate: () => false,
      hasInterest:() => true,
    };
    const mockClaimFee = 100;
    const mockTotalAmount = 1200;
    (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaimData);

    const mockBusinessProcessData = {
      hasBusinessProcessFinished: () => false,
      isInterestFromASpecificDate: () => false,
    };
    (getClaimBusinessProcess as jest.Mock).mockResolvedValueOnce(mockBusinessProcessData);
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          totalClaimAmount: mockClaimData.totalClaimAmount.toFixed(2),
          interest: mockClaimData.interest.totalInterest.amount,
          claimFee: mockClaimFee,
          paymentSyncError: false,
          hasInterest: true,
          pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
          totalAmount: mockTotalAmount.toFixed(2),
          hasBusinessProcessFinished: false,
        });
      });
  });

  it('should clear payment sync error when present', async () => {
    const claimId = '111111';
    const mockClaimData = {
      totalClaimAmount: 1000,
      claimInterest: 'no',
      claimFee: {
        calculatedAmountInPence: 10000,
      },
      paymentSyncError: true,
    };
    (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaimData);
    (getClaimBusinessProcess as jest.Mock).mockResolvedValueOnce({
      hasBusinessProcessFinished: () => false,
    });

    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.paymentSyncError).toBe(true);
        expect(res.body.hasInterest).toBe(false);
        expect(res.body.interest).toBe(0);
        expect(res.body.totalAmount).toBe('1100.00');
      });
  });

  it('should handle missing claim fee and total amount on GET', async () => {
    const claimId = '111111';
    const mockClaimData = {
      claimInterest: 'no',
    };
    (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaimData);
    (getClaimBusinessProcess as jest.Mock).mockResolvedValueOnce({
      hasBusinessProcessFinished: () => true,
    });

    await request(app)
      .get(CLAIM_FEE_BREAKUP.replace(':id', claimId)).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.hasInterest).toBe(false);
        // convertToPoundsFilter(undefined) is NaN, which JSON serialises as null.
        expect(res.body.claimFee).toBeNull();
        expect(res.body.totalClaimAmount).toBeUndefined();
      });
  });

  it('should clear payment sync error when the session has no user', async () => {
    const sessionlessApp = express();
    sessionlessApp.use(express.json());
    sessionlessApp.use((req, res, next) => {
      req.session = {} as unknown as Session;
      res.render = jest.fn((view, options) => res.status(200).send(options)) as unknown as express.Response['render'];
      next();
    });
    sessionlessApp.use(claimFeeBreakDownController);

    (getClaimById as jest.Mock).mockResolvedValueOnce({
      totalClaimAmount: 1000,
      claimInterest: 'no',
      claimFee: {calculatedAmountInPence: 10000},
      paymentSyncError: true,
    });
    (getClaimBusinessProcess as jest.Mock).mockResolvedValueOnce({
      hasBusinessProcessFinished: () => true,
    });

    await request(sessionlessApp)
      .get(CLAIM_FEE_BREAKUP.replace(':id', '111111')).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.paymentSyncError).toBe(true);
      });
  });

  it('should return 500 status code when error occurs', async () => {
    //given
    app.locals.draftStoreClient = mockRedisFailure;
    //when-then
    await request(app)
      .get(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});
describe('on POST', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  it('should handle the get call of fee summary details', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({});
    app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
    await request(app)
      .post(CLAIM_FEE_BREAKUP)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
  it('should enable the warning text if payment request is failed', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockRejectedValueOnce(new Error('something went wrong'));
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });
  it('should redirect to confirmation url if already paid', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Success'});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_PAYMENT_CONFIRMATION_URL);
      });
  });
  it('should get new payment ref if previous payment failed', async () => {
    const paymentUrl = 'paymentUrl';
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Failed'});
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({nextUrl: paymentUrl});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(paymentUrl);
      });
  });
  it('should get new payment ref if previous payment failed - no payment data returned', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Failed'});
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(undefined);
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });
  it('should redirect to fee breakup when payment status is pending and nextUrl is missing', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce({status: 'Pending'});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });

  it('should redirect to fee breakup when no payment redirect information exists', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce(undefined);
    (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });

  it('should redirect to fee breakup when the payment status is unavailable', async () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    jest.spyOn(feePaymentServiceModule, 'getFeePaymentStatus').mockResolvedValueOnce(undefined);
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
      });
  });

  it('should return 500 when the claim has no claim details', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation').mockResolvedValueOnce({});
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(500);
      });
  });

  describe('without a signed-in user on the session', () => {
    let originalSession: unknown;

    beforeEach(() => {
      originalSession = app.request['session'];
      app.request['session'] = {} as unknown as Session;
    });

    afterEach(() => {
      app.request['session'] = originalSession as Session;
    });

    it('should return 500 when saving the payment reference without a user id', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      claim.claimDetails.claimFeePayment = {paymentReference: 'RC-1234-1234-1234-1234'};
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .post(CLAIM_FEE_BREAKUP).expect((res) => {
          expect(res.status).toBe(500);
        });
    });

    it('should record the payment sync error without a user id when the payment request fails', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      jest.spyOn(CivilServiceClient.prototype, 'getFeePaymentRedirectInformation')
        .mockRejectedValueOnce(new Error('something went wrong'));
      await request(app)
        .post(CLAIM_FEE_BREAKUP).expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_FEE_BREAKUP);
        });
    });
  });

  it('should return 500 when draft store lookup fails', async () => {
    (getCaseDataFromStore as jest.Mock).mockReset();
    (getCaseDataFromStore as jest.Mock).mockImplementation(() => {
      throw new Error('redis down');
    });
    await request(app)
      .post(CLAIM_FEE_BREAKUP).expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});
