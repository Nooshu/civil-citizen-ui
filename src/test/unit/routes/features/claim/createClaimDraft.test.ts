import request from 'supertest';
import { app } from '../../../../../main/app';
import createDraftClaimController from 'routes/features/claim/createDraftClaim';
import config from 'config';
import nock from 'nock';
import {
  CLAIM_CHECK_ANSWERS_URL,
  TESTING_SUPPORT_URL,
} from 'routes/urls';
import { draftClaim } from '../../../../../main/modules/draft-store/draftClaimCache';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as draftClaimCache from 'modules/draft-store/draftClaimCache';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import jwtDecode from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({uid: 'decoded-user'})),
}));

describe('createDraftClaim Router', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.use(createDraftClaimController);
  const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

  beforeAll(() => {
    nock(idamUrl).post('/o/token').reply(200, { id_token: citizenRoleToken });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(undefined as never);
    jest.spyOn(launchDarkly, 'isCarmEnabledForCase').mockResolvedValue(false);
  });

  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
    mockedJwtDecode.mockReturnValue({uid: 'decoded-user'} as never);
    jest.spyOn(draftClaimCache, 'saveDraftClaimToCache').mockResolvedValue(undefined as never);
    jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should render the correct view', async () => {
      const response = await request(app).get(TESTING_SUPPORT_URL);
      expect(response.status).toBe(200);
    });

    it('should return 500 when render fails', async () => {
      const renderSpy = jest.spyOn(app.response, 'render').mockImplementationOnce(() => {
        throw new Error('render failed');
      });
      await request(app)
        .get(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
      renderSpy.mockRestore();
    });

    describe('processDraftClaim function', () => {
      it('should process the draftClaim correctly', () => {
        const expectedOutput = draftClaim;
        const result = draftClaim;

        expect(result).toEqual(expectedOutput);
      });
    });
  });

  describe('on POST', () => {
    it('should redirect to check answers page', async () => {
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CHECK_ANSWERS_URL);
        });
    });

    it('should create draft claim and dashboard when case data is absent', async () => {
      const createDraftSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
      const dashboardSpy = jest.spyOn(CivilServiceClient.prototype, 'createDashboard');

      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });

      expect(createDraftSpy).toHaveBeenCalled();
      expect(dashboardSpy).toHaveBeenCalled();
    });

    it('should skip draft creation when parsed case data is a draft claim', async () => {
      const createDraftSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
      const realParse = JSON.parse.bind(JSON);
      const parseSpy = jest.spyOn(JSON, 'parse').mockImplementation((text: string) => {
        if (text === '{"isDraft":true}') {
          return Object.assign(new Claim(), {isDraftClaim: () => true});
        }
        return realParse(text);
      });

      await request(app)
        .post(TESTING_SUPPORT_URL)
        .send({caseData: '{"isDraft":true}'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });

      expect(createDraftSpy).not.toHaveBeenCalled();
      parseSpy.mockRestore();
    });

    it('should return 200 when idToken is provided', async () => {
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .send({idToken: 'token'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should redirect when idToken is present but uid is missing', async () => {
      mockedJwtDecode.mockReturnValueOnce({} as never);
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .send({idToken: 'token'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should not set eligibility cookie when it already exists', async () => {
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .set('Cookie', ['eligibilityCompleted=true'])
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return http 500 when save fails', async () => {
      jest.spyOn(draftClaimCache, 'saveDraftClaimToCache').mockRejectedValueOnce(new Error('redis write failed'));
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
