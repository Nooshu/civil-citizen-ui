import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {CLAIMANT_RESPONSE_REJECTION_REASON_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../test/utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import * as claimantResponseService from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {ClaimantResponse} from 'models/claimantResponse';
import {CourtProposedPlan, CourtProposedPlanOptions} from 'common/form/models/claimantResponse/courtProposedPlan';
import {RejectionReason} from 'common/form/models/claimantResponse/rejectionReason';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claimant Response - Rejection reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return rejection response page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render with judge repayment plan decision when requested', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const claimantResponse = new ClaimantResponse();
      claimantResponse.courtProposedPlan = new CourtProposedPlan(CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN);
      claimantResponse.rejectionReason = new RejectionReason('existing reason');
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(claimantResponse);

      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render with empty rejection reason when claimant response has none', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const claimantResponse = new ClaimantResponse();
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(claimantResponse);

      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    // A falsy-but-indexable value is the only way to reach the `new RejectionReason()` fallback:
    // the controller reads `isRequestJudgePaymentPlan` off the response before the truthiness check.
    it('should fall back to an empty rejection reason when the claimant response is falsy', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      jest.spyOn(claimantResponseService, 'getClaimantResponse')
        .mockResolvedValueOnce('' as unknown as ClaimantResponse);

      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return http 500 when reading the claimant response fails', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      jest.spyOn(claimantResponseService, 'getClaimantResponse')
        .mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant-response task list page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CLAIMANT_REJECTION_REASON);
        });
    });
    it('should return error with judge repayment plan decision when requested', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const claimantResponse = new ClaimantResponse();
      claimantResponse.courtProposedPlan = new CourtProposedPlan(CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN);
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(claimantResponse);

      await request(app)
        .post(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CLAIMANT_REJECTION_REASON);
        });
    });
    it('should return http 500 when saving the rejection reason fails', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      jest.spyOn(claimantResponseService, 'saveClaimantResponse')
        .mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when saving into redis has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_REJECTION_REASON_URL)
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
