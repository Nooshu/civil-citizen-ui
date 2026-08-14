import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {
  mockCivilClaimClaimantIntention,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {YesNo} from 'form/models/yesNo';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

const civilServiceUrl = config.get<string>('services.civilService.url');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/common/utils/dateUtils');

describe('Judgment Amount Summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .reply(200, '0');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '0');
  });

  describe('on GET', () => {
    it('should return judgement summary page - from request CCJ', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;

      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should use language from the query string', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;
      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .query({lang: 'cy'});
      expect(res.status).toBe(200);
    });

    it('should use language from cookie when query is absent', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;
      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .set('Cookie', ['lang=en']);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should use partial admission amount when claimant accepted admitted amount', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      claim.claimFee = {calculatedAmountInPence: '10000'} as Claim['claimFee'];
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES} as ClaimantResponse['hasPartAdmittedBeenAccepted'];
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(250);
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValueOnce(claim);

      const res = await request(app).get(CCJ_PAID_AMOUNT_SUMMARY_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('250.00');
    });

    it('should render when the claim has no claim fee', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      claim.claimantResponse = new ClaimantResponse();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(250);
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValueOnce(claim);

      const res = await request(app).get(CCJ_PAID_AMOUNT_SUMMARY_URL);
      expect(res.status).toBe(200);
    });

    it('should return http 500 when has error in the get method - from request CCJ', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to ccj payment options - from request CCJ', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;
      const res = await request(app).post(CCJ_PAID_AMOUNT_SUMMARY_URL).send();
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAYMENT_OPTIONS_URL);
    });
  });

});
