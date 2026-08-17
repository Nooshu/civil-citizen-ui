import express from 'express';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  mockCivilClaimWithExpertAndWitness,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {
  DQ_COURT_LOCATION_URL,
  SUPPORT_REQUIRED_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'form/models/yesNo';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import * as supportRequiredService from 'services/features/directionsQuestionnaire/supportRequiredService';
import {SupportRequiredList} from 'models/directionsQuestionnaire/supportRequired';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const supportRequiredUrl = SUPPORT_REQUIRED_URL.replace(':id', 'aaa');

describe('Support required', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCarmEnabledForCase').mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should return supportRequired page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you, your experts or witnesses need support to attend a hearing');
        });
    });
    it('should use language from the query string', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(supportRequiredUrl)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
        });
    });
    it('should use language from cookie when query is absent', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(supportRequiredUrl)
        .set('Cookie', ['lang=en'])
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you, your experts or witnesses need support to attend a hearing');
        });
    });
    it('should enable carm path when feature flag and small claims track apply', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      jest.spyOn(launchDarkly, 'isCarmEnabledForCase').mockResolvedValueOnce(true);
      jest.spyOn(Claim.prototype, 'isSmallClaimsTrackDQ', 'get').mockReturnValueOnce(true);
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
        });
    });
    it('should render when the stored support required list is undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      jest.spyOn(supportRequiredService, 'getSupportRequired').mockResolvedValueOnce(undefined);
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render when the stored support required list has no people', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      jest.spyOn(supportRequiredService, 'getSupportRequired').mockResolvedValueOnce(new SupportRequiredList());
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
    });

    it('wshould display error when there is no option selection', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SELECT_YES_IF_SUPPORT);
        });
    });

    it('should use language from query when re-rendering validation errors', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .query({lang: 'cy'})
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when re-rendering validation errors', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .set('Cookie', ['lang=en'])
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should evaluate the carm small claims path when re-rendering validation errors', async () => {
      jest.spyOn(launchDarkly, 'isCarmEnabledForCase').mockResolvedValueOnce(true);
      jest.spyOn(Claim.prototype, 'isSmallClaimsTrackDQ', 'get').mockReturnValueOnce(true);
      await request(app)
        .post(supportRequiredUrl)
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SELECT_YES_IF_SUPPORT);
        });
    });

    it('when yes selected, name provided and any checkbox selected, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [
              {
                declared: 'disabledAccess',
                fullName: 'johndoe',
              },
            ],
          },
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('when no selected, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          model: {},
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('changing from yes to no should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          declared: ['disabledAccess'],
          model: {
            items: [
              {fullName: 'johndoe'},
            ],
          },
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_COURT_LOCATION_URL.replace(':id', 'aaa'));
        });
    });

    it('should show error when yes selected but no name provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              fullName: '',
            }]},
        })
        .expect((res:Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_NAME_SELECTED);
        });
    });

    it('should show error when yes selected but no support selected', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_SUPPORT_SELECTED);
        });
    });

    it('should show error when yes and sign language interpreter selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              declared: 'signLanguageInterpreter',
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_SIGN_LANGUAGE_ENTERED);
        });
    });

    it('should show error when yes and language interpreter selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          model: {
            items: [{
              declared: 'languageInterpreter',
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_LANGUAGE_ENTERED);
        });
    });

    it('should show error when yes and other support selected, but no free text provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.YES,
          declared: ['otherSupport'],
          model: {
            items: [{
              fullName: 'johndoe',
            }],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NO_OTHER_SUPPORT);
        });
    });

    it('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(supportRequiredUrl)
        .send({
          option: YesNo.NO,
          declared: ['disabledAccess'],
          model: {
            items: [
              {fullName: 'johndoe'},
            ],
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
