import config from 'config';
import express from 'express';
import nock from 'nock';
import request from 'supertest';
import {Session} from 'express-session';
import {app} from '../../../../../../main/app';
import finaliseTrialArrangementsController from 'routes/features/caseProgression/trialArrangements/finaliseTrialArrangementsController';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import Module from 'module';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockCivilClaimFastTrack, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {DocumentType} from 'models/document/documentType';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;
describe('"finalise trial arrangements" page test', () => {
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  claim.case_data.systemGeneratedCaseDocuments= [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.DEFENDANT_DEFENCE,
        documentLink:  {
          document_url: 'url1',
          document_filename: 'filename1',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SDO_ORDER,
        documentLink: {
          document_url: 'url1',
          document_filename: 'filename1',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    }];
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

  beforeAll((done) => {
    testSession
      .get('/oauth2/callback')
      .query('code=ABC')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
  describe('on GET', () => {
    it('should return expected page in English when claim exists', async () => {
      //Given
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Finalise your trial arrangements');
        });
    });

    it('should use language from the query string', async () => {
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
        .query({lang: 'cy'})
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Cwblhau trefniadau eich treial');
        });
    });

    it('should use claimant dashboard url when case role is claimant', async () => {
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock.cleanAll();
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.CLAIMANT]);
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
        .expect((res: { status: unknown; text: string }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`/dashboard/${claimId}/claimant`);
        });
    });

    it('should use defendant dashboard url when case role is defendant', async () => {
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock.cleanAll();
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.DEFENDANT]);
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
        .expect((res: { status: unknown; text: string }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`/dashboard/${claimId}/defendant`);
        });
    });

    it('should return expected page in Welsh when claim exists with Welsh cookie', async () => {
      //Given
      app.request.cookies = {lang: 'cy'};
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Cwblhau trefniadau eich treial');
        });
    });

    it('should redirect to latestUpload screen when is small claim', async () => {
      //Given
      app.locals.draftStoreClient = mockCivilClaim;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
        });
    });

    // Mounted standalone so the request reaches the controller with a session that has no
    // signed-in user, which is the only way to exercise the `session.user?.id` fallback.
    it('should render when the session has no signed-in user', async () => {
      const sessionlessApp = express();
      sessionlessApp.use((req, res, next) => {
        req.session = {} as unknown as Session;
        req.cookies = {};
        res.render = ((view: string) => res.status(200).send(view)) as express.Response['render'];
        next();
      });
      sessionlessApp.use(finaliseTrialArrangementsController);

      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock.cleanAll();
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.CLAIMANT]);

      await request(sessionlessApp)
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
      //Given
      app.request.cookies = {lang: 'en'};
      app.locals.draftStoreClient = mockRedisFailure;
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(new Error('claim missing'));
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', '1111'))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
