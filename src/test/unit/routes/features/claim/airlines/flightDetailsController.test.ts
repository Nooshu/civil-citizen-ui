import {app} from '../../../../../../main/app';
import config from 'config';
import express, {Response} from 'express';
import nock from 'nock';
import request from 'supertest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  FLIGHT_DETAILS_URL, 
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { CivilServiceClient } from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import flightDetailsController from 'routes/features/claim/airlines/flightDetailsController';

jest.mock('client/civilServiceClient');
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockGetAirlines = civilServiceClient.getAirlines as jest.Mock;

describe('Flight details Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;

    mockGetAirlines.mockImplementation(() => {
      return [
        {airline: 'airline 1', epimsID: '1'}, 
        {airline: 'airline 2', epimsID: '2'},
      ];
    });
  });

  describe('on GET', () => {
    it('should return flight details page', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      await request(app)
        .get(FLIGHT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.FLIGHT_DETAILS.FLIGHT_DETAILS'));
        });
    });

    it('should use language from the query string', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      await request(app)
        .get(FLIGHT_DETAILS_URL)
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when query is absent', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      await request(app)
        .get(FLIGHT_DETAILS_URL)
        .set('Cookie', ['lang=en'])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.FLIGHT_DETAILS.FLIGHT_DETAILS'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'getAirlines').mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      await request(app)
        .get(FLIGHT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect when flight details are ok', async () => {
      const flightDetails = {
        airline: 'Ryanair',
        flightNumber: '121314',
        year: '2023',
        month: '9',
        day: '29',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .send(flightDetails)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        });
    });
    it('should return errors on empty inputs', async () => {
      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.FLIGHT_DETAILS.FLIGHT_NUMBER_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should use language from the query string when re-rendering validation errors', async () => {
      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .query({lang: 'cy'})
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when re-rendering validation errors', async () => {
      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .set('Cookie', ['lang=en'])
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'getAirlines').mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .send({
          airline: 'Ryanair',
          flightNumber: '121314',
          year: '2023',
          month: '9',
          day: '29',
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  // Mounted standalone so every shape of `req.session` reaches the controller and exercises
  // both sides of the `session?.user?.id` chains on GET and POST.
  describe.each([
    {label: 'a signed-in user', session: {user: {id: 'user-id'}}},
    {label: 'a session without a user', session: {}},
    {label: 'no session at all', session: undefined},
  ])('with $label', ({session}) => {
    const sessionlessApp = express();
    sessionlessApp.use(express.json());
    sessionlessApp.use(express.urlencoded({extended: true}));
    sessionlessApp.use((req, res, next) => {
      (req as AppRequest).session = session as AppRequest['session'];
      req.cookies = {};
      res.render = ((view: string) => res.status(200).send(view)) as Response['render'];
      next();
    });
    sessionlessApp.use(flightDetailsController);

    beforeEach(() => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => new Claim());
      mockGetAirlines.mockResolvedValue([{airline: 'airline 1', epimsID: '1'}]);
    });

    it('should still render the flight details page', async () => {
      await request(sessionlessApp).get(FLIGHT_DETAILS_URL).expect(200);
    });

    it('should still save the flight details and redirect', async () => {
      await request(sessionlessApp)
        .post(FLIGHT_DETAILS_URL)
        .send({airline: 'Ryanair', flightNumber: '121314', year: '2023', month: '9', day: '29'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        });
    });
  });
});
