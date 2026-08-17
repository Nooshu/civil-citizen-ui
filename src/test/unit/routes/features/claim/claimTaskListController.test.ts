import {app} from '../../../../../main/app';
import config from 'config';
import express, {Response} from 'express';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {t} from 'i18next';
import nock from 'nock';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as claimTaskListService from 'services/features/claim/taskListService';
import * as commonTaskListService from 'services/features/common/taskListService';
import {AppRequest} from 'models/AppRequest';
import claimTaskListController from 'routes/features/claim/claimTaskListController';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claim TaskList page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let renderSpy: jest.SpyInstance;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);
  });

  describe('on GET', () => {
    const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
    beforeEach(() => {
      jest.clearAllMocks();
      renderSpy = jest.spyOn(app.response, 'render').mockImplementation(function (view: string, options?: object) {
        return this.send({view, options});
      });
    });

    afterEach(() => {
      renderSpy.mockRestore();
    });

    it('should return claim tasklist page with existing draft claim', async () => {
      const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      claim.draftClaimCacheTtlDays = 30;
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body.view).toBe('features/claim/task-list');
          expect(res.body.options.pageTitle).toBe('PAGES.CLAIM_TASK_LIST.PAGE_TITLE');
          expect(res.body.options.draftClaimDeletionDate).toBeDefined();
        });
      expect(createDraftClaimSpy).not.toBeCalled();
    });

    it('should use language from the query string', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when query is absent', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .set('Cookie', ['lang=en'])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
    });

    it('should show application incomplete title when all sections complete', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      jest.spyOn(claimTaskListService, 'getTaskLists').mockReturnValue([]);
      jest.spyOn(commonTaskListService, 'calculateTotalAndCompleted').mockReturnValue({
        completed: 1,
        total: 1,
      });
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .query({lang: 'en'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.APPLICATION_INCOMPLETE', {lng: 'en'}));
        });
    });

    it('should create draft when case data is missing', async () => {
      const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(undefined);
      jest.spyOn(claimTaskListService, 'getTaskLists').mockReturnValue([]);
      jest.spyOn(commonTaskListService, 'calculateTotalAndCompleted').mockReturnValue({
        completed: 0,
        total: 1,
      });
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .query({lang: 'en'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
      expect(createDraftClaimSpy).toBeCalled();
    });

    it('should create a new draft claim after completing eligibility', async () => {
      const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');
      app.request.cookies = {eligibilityCompleted: true};
      const emptyClaim = new Claim();
      const draftClaim = new Claim();
      draftClaim.draftClaimCreatedAt = new Date();
      draftClaim.draftClaimCacheTtlDays = 30;
      (getCaseDataFromStore as jest.Mock)
        .mockResolvedValueOnce(emptyClaim)
        .mockResolvedValueOnce(draftClaim);
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body.view).toBe('features/claim/task-list');
          expect(res.body.options.pageTitle).toBe('PAGES.CLAIM_TASK_LIST.PAGE_TITLE');
          expect(res.body.options.draftClaimDeletionDate).toBeDefined();
        });
      expect(createDraftClaimSpy).toBeCalled();
    });

    it('should return http 500 when has error in the get method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(new Error('error'));
      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.view).toBe('error');
        });
    });
  });

  // Mounted standalone so every shape of `req.session` reaches the controller and exercises
  // both sides of the `session?.user?.id` chain.
  describe.each([
    {label: 'a signed-in user', session: {user: {id: 'user-id'}}},
    {label: 'a session without a user', session: {}},
    {label: 'no session at all', session: undefined},
  ])('with $label', ({session}) => {
    const sessionlessApp = express();
    sessionlessApp.use((req, res, next) => {
      (req as AppRequest).session = session as AppRequest['session'];
      req.cookies = {};
      res.render = ((view: string) => res.status(200).send(view)) as Response['render'];
      next();
    });
    sessionlessApp.use(claimTaskListController);

    it('should still render the task list page', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      await request(sessionlessApp).get(CLAIMANT_TASK_LIST_URL).expect(200);
    });
  });
});
