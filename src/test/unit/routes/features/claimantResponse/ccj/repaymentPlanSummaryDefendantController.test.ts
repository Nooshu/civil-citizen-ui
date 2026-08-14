import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CCJ_REPAYMENT_PLAN_DEFENDANT_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('CCJ - repayment plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return repayment plan page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN'));
    });

    it('should use language from the query string', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app)
        .get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL)
        .query({lang: 'cy'});
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN', {lng: 'cy'}));
    });

    it('should use language from cookie when query is absent', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app)
        .get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL)
        .set('Cookie', ['lang=en']);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN', {lng: 'en'}));
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
