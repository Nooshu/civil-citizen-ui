import express from 'express';
import request from 'supertest';
import {Session} from 'express-session';
import {app} from '../../../../../main/app';
import qmViewQueriesController from 'routes/features/queryManagement/qmViewQueriesController';
import {QM_VIEW_QUERY_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as ViewQueriesService from 'services/features/queryManagement/viewQueriesService';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ViewObjects} from 'form/models/queryManagement/viewQuery';
import * as dashboardService from 'services/dashboard/dashboardService';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {CivilServiceClient} from 'client/civilServiceClient';
const mockBuildQueryListItems = ViewQueriesService.ViewQueriesService.buildQueryListItems as jest.Mock;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('services/features/queryManagement/viewQueriesService');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '12345';
const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
}));

describe('View query controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.CLAIMANT]);
  });

  describe('GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render query page', async () => {

      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Messages');
        });
    });

    it('should use language from the query string', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should use language from cookie when query is absent', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .set('Cookie', ['lang=en'])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Messages');
        });
    });

    it('should render with defendant dashboard url for defendant role', async () => {
      nock.cleanAll();
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.DEFENDANT]);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);

      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`/dashboard/${claimId}/defendant`);
        });
    });

    it('should render view query page with query list items', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue(Array.of(
        new ViewObjects(
          '1',
          'you',
          'Test Subject',
          '13 February 2025, 11:30:10 am',
          'Court staff',
          '13 February 2025, 11:30:10 am',
          'Response received',
        ),
        new ViewObjects(
          '2',
          'you',
          'another Test Subject',
          '13 February 2025, 11:30:10 am',
          'Court staff',
          '13 February 2025, 11:30:10 am',
          'Response received',
        ),
      ));

      const res = await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(res.text).toContain('Message subject');
      expect(res.text).toContain('Sent by');
      expect(res.text).toContain('Sent on');
      expect(res.text).toContain('Last updated by');
      expect(res.text).toContain('Last updated on');
      expect(res.text).toContain('Status');
      // Row 1
      expect(res.text).toContain('Test Subject');
      expect(res.text).toContain('13 February 2025, 11:30:10 am');
      expect(res.text).toContain('Court staff');
      expect(res.text).toContain('13 February 2025, 11:30:10 am');
      expect(res.text).toContain('Response received');
      // Row 2
      expect(res.text).toContain('another Test Subject');
      expect(res.text).toContain('13 February 2025, 11:30:10 am');
      expect(res.text).toContain('Court staff');
      expect(res.text).toContain('13 February 2025, 11:30:10 am');
      expect(res.text).toContain('Response received');
    });

    it('should render query page with no items', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue([]);
      const res = await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(res.text).toContain('Messages');
      expect(res.text).not.toContain('Test Subject');
    });

    it('should register click for response notification', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue([]);
      const dashboardNotif = new DashboardNotification('123', '', '',
        'The court has responded to a message on your case.', '', 'Click', undefined, undefined, '', '');
      const dashboardNotifList = new DashboardNotificationList();
      dashboardNotifList.items = Array(dashboardNotif);
      jest.spyOn(dashboardService, 'getNotifications').mockReturnValue(new Promise(
        (resolve) => resolve(dashboardNotifList),
      ));
      CivilServiceClient.prototype.recordClick = jest.fn().mockResolvedValue({});
      const res = await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(res.text).toContain('Messages');
      expect(res.text).not.toContain('Test Subject');
      expect(CivilServiceClient.prototype.recordClick).toHaveBeenCalled();
    });

    it('should register click for sent message notification wording', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      mockBuildQueryListItems.mockReturnValue([]);
      const dashboardNotif = new DashboardNotification('456', '', '',
        'There has been a message sent on your case.', '', 'Click', undefined, undefined, '', '');
      const dashboardNotifList = new DashboardNotificationList();
      dashboardNotifList.items = Array(dashboardNotif);
      jest.spyOn(dashboardService, 'getNotifications').mockResolvedValue(dashboardNotifList);
      CivilServiceClient.prototype.recordClick = jest.fn().mockResolvedValue({});
      await request(app).get(QM_VIEW_QUERY_URL.replace(':id', claimId)).expect(200);
      expect(CivilServiceClient.prototype.recordClick).toHaveBeenCalled();
    });

    // Mounted standalone so each shape of `req.session` reaches the controller and exercises
    // every `session?.user?.id` fallback.
    describe.each([
      {label: 'a signed-in user', session: {user: {id: 'user-id'}} as unknown as Session},
      {label: 'a session without a user', session: {} as unknown as Session},
      {label: 'no session at all', session: undefined as unknown as Session},
    ])('with $label', ({session}) => {
      const sessionlessApp = express();
      sessionlessApp.use((req, res, next) => {
        req.session = session;
        req.cookies = {};
        res.render = ((view: string) => res.status(200).send(view)) as express.Response['render'];
        next();
      });
      sessionlessApp.use(qmViewQueriesController);

      it('should still render the view queries page', async () => {
        nock(civilServiceUrl)
          .get(CIVIL_SERVICE_CASES_URL + claimId)
          .reply(200, claim);
        nock(civilServiceUrl)
          .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
          .reply(200, [CaseRole.CLAIMANT]);
        mockBuildQueryListItems.mockReturnValue([]);

        await request(sessionlessApp)
          .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
          .expect((res) => {
            expect(res.status).toBe(200);
          });
      });
    });

    it('should return http 500 when has error', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);
      await request(app)
        .get(QM_VIEW_QUERY_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
