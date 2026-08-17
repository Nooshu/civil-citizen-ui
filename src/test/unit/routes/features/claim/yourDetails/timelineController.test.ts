import config from 'config';
import express, {Response} from 'express';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';
import timelineController from 'routes/features/claim/yourDetails/timelineController';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claimant Timeline Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render timeline page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Timeline of events');
      });
    });

    it('should use language from the query string', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_TIMELINE_URL)
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when query is absent', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_TIMELINE_URL)
        .set('Cookie', ['lang=en'])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Timeline of events');
        });
    });

    it('should return 500 page on redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render timeline page if there are validation errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: []}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.AT_LEAST_ONE_ROW);
      });
    });

    it('should use language from the query string when re-rendering validation errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_TIMELINE_URL)
        .query({lang: 'cy'})
        .send({rows: []})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when re-rendering validation errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_TIMELINE_URL)
        .set('Cookie', ['lang=en'])
        .send({rows: []})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.AT_LEAST_ONE_ROW);
        });
    });

    it('should return 500 page if there are errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should update data and redirect to evidence page if all required details are provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
      });
    });

    it('should save data if applicant doesn\'t exist and redirect to evidence page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
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
    sessionlessApp.use(timelineController);

    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should still render the timeline page', async () => {
      await request(sessionlessApp).get(CLAIM_TIMELINE_URL).expect(200);
    });

    it('should still save the timeline and redirect to the evidence page', async () => {
      await request(sessionlessApp)
        .post(CLAIM_TIMELINE_URL)
        .send({rows: [{day: 1, month: 3, year: 2023, description: 'Raised an issue with Mr. Smith'}]})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
        });
    });
  });
});
