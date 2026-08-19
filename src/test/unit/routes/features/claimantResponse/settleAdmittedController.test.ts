import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {CaseState} from 'form/models/claimDetails';
import * as utilService from 'modules/utilityService';
import {Claim} from 'models/claim';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {ResponseType} from 'form/models/responseType';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import * as claimantResponseService from 'services/features/claimantResponse/claimantResponseService';
import {ClaimantResponse} from 'models/claimantResponse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Claimant Response - Settle Part Admit Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.totalClaimAmount = 1000;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(250, 1000);
  jest.mock('modules/utilityService', () => ({
    getRedisStoreForSession: jest.fn(),
  }));

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the');
        expect(res.text).toContain('£250');
      });
    });

    it('should show the full claim amount when the defendant fully admitted', async () => {
      const fullAdmitClaim = new Claim();
      fullAdmitClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      fullAdmitClaim.totalClaimAmount = 1000;
      fullAdmitClaim.respondent1 = new Party();
      fullAdmitClaim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(fullAdmitClaim);
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(undefined);

      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('£1000');
        expect(res.text).not.toContain('£NaN');
      });
    });

    it('should return settle claim page for a full defence states-paid claim', async () => {
      const fullDefenceClaim = new Claim();
      fullDefenceClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      fullDefenceClaim.totalClaimAmount = 1000;
      fullDefenceClaim.respondent1 = new Party();
      fullDefenceClaim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      fullDefenceClaim.rejectAllOfClaim = new RejectAllOfClaim();
      fullDefenceClaim.rejectAllOfClaim.howMuchHaveYouPaid = Object.assign(new HowMuchHaveYouPaid(), {amount: 50000});
      const claimantResponse = new ClaimantResponse();
      claimantResponse.hasFullDefenceStatesPaidClaimSettled = new GenericYesNo(YesNo.YES);
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(fullDefenceClaim);
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValue(claimantResponse);

      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the');
        expect(res.text).toContain('£500');
      });
    });

    it('should return settle claim page when there is no saved claimant response', async () => {
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(undefined);

      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the');
      });
    });

    it('should return settle claim page for a full defence claim with no saved claimant response', async () => {
      const fullDefenceClaim = new Claim();
      fullDefenceClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      fullDefenceClaim.totalClaimAmount = 1000;
      fullDefenceClaim.respondent1 = new Party();
      fullDefenceClaim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      fullDefenceClaim.rejectAllOfClaim = new RejectAllOfClaim();
      fullDefenceClaim.rejectAllOfClaim.howMuchHaveYouPaid = Object.assign(new HowMuchHaveYouPaid(), {amount: 50000});
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(fullDefenceClaim);
      jest.spyOn(claimantResponseService, 'getClaimantResponse').mockResolvedValueOnce(undefined);

      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the');
      });
    });

    it('should return status 500 when reading the claimant response fails', async () => {
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      jest.spyOn(claimantResponseService, 'getClaimantResponse')
        .mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when error thrown', async () => {
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {

    it('should return error on empty post', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response reject reason page if option no is selected', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should save full defence settlement choice when option yes is selected', async () => {
      const fullDefenceClaim = new Claim();
      fullDefenceClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      fullDefenceClaim.totalClaimAmount = 1000;
      fullDefenceClaim.respondent1 = new Party();
      fullDefenceClaim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      fullDefenceClaim.rejectAllOfClaim = new RejectAllOfClaim();
      fullDefenceClaim.rejectAllOfClaim.howMuchHaveYouPaid = Object.assign(new HowMuchHaveYouPaid(), {amount: 50000});
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(fullDefenceClaim);
      const saveSpy = jest.spyOn(claimantResponseService, 'saveClaimantResponse').mockResolvedValue();
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
      expect(saveSpy).toHaveBeenCalled();
      expect(saveSpy.mock.calls[0][2]).toBe('hasFullDefenceStatesPaidClaimSettled');
    });

    it('should return status 500 when saving the claimant response fails', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      jest.spyOn(claimantResponseService, 'saveClaimantResponse')
        .mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when error thrown', async () => {
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
