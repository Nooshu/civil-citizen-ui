import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {DASHBOARD_CLAIMANT_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {
  mockCivilClaim, mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claim fee payment confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claimId = '1645882162449409';

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving unsuccessful payment page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant dashboard', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(PAY_CLAIM_FEE_UNSUCCESSFUL_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
        });
    });
  });
});
