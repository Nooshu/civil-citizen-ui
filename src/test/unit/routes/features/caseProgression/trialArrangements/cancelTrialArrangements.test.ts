import {
  mockCivilClaimFastTrack, mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {CANCEL_TRIAL_ARRANGEMENTS, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {CaseRole} from 'form/models/caseRoles';
import civilClaimResponseFastTrackMock from '../../../../../utils/mocks/civilClaimResponseFastTrackMock.json';
const session = require('supertest-session');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const testSession = session(app);

const mockClaimantRedis = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => {
    const payload = JSON.parse(JSON.stringify(civilClaimResponseFastTrackMock));
    payload.case_data.caseRole = CaseRole.CLAIMANT;
    return Promise.resolve(JSON.stringify(payload));
  }),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve(-1)),
  expireat: jest.fn(() => Promise.resolve({})),
};

describe('Cancel trial arrangements - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should redirect to defendant page', async () => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    await testSession
      .get(CANCEL_TRIAL_ARRANGEMENTS.replace(':id', claimId))
      .expect((res: { status: unknown; header: {location: unknown} }) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
      });
  });

  it('should redirect to claimant dashboard when claim role is claimant', async () => {
    app.locals.draftStoreClient = mockClaimantRedis;
    await testSession
      .get(CANCEL_TRIAL_ARRANGEMENTS.replace(':id', claimId))
      .expect((res: { status: unknown; header: {location: unknown} }) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL.replace(':id', claimId));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await testSession
      .get(CANCEL_TRIAL_ARRANGEMENTS.replace(':id', '1111'))
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
      });
  });
});
