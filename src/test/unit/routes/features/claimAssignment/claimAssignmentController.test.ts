import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {ASSIGN_CLAIM_URL, DASHBOARD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import * as utilityService from 'modules/utilityService';
import * as firstContactService from 'services/firstcontact/firstcontactService';

jest.mock('../../../../../main/modules/oidc');

describe('claim assignment controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let getFirstContactDataSpy: jest.SpyInstance;
  let getClaimByIdSpy: jest.SpyInstance;
  let assignSpy: jest.SpyInstance;
  let deleteDraftSpy: jest.SpyInstance;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    getFirstContactDataSpy = jest.spyOn(firstContactService, 'getFirstContactData').mockReturnValue({});
    getClaimByIdSpy = jest.spyOn(utilityService, 'getClaimById').mockResolvedValue({} as Claim);
    assignSpy = jest.spyOn(CivilServiceClient.prototype, 'assignDefendantToClaim')
      .mockResolvedValue(undefined as never);
    deleteDraftSpy = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should assign claim, delete draft, and redirect to dashboard when claimId is present', async () => {
      getFirstContactDataSpy.mockReturnValue({claimId: '123'});
      getClaimByIdSpy.mockResolvedValue({
        respondent1PinToPostLRspec: {accessCode: 'PIN'},
      } as Claim);

      // Must await: unawaited supertest leaves an ephemeral http.Server listening and Jest
      // workers fail to exit gracefully after large suites.
      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);

      expect(assignSpy).toHaveBeenCalledWith('123', expect.anything(), 'PIN');
      expect(deleteDraftSpy).toHaveBeenCalledWith('123');
    });

    it('should redirect to dashboard without assigning when claimId is missing', async () => {
      getFirstContactDataSpy.mockReturnValue({});

      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);

      expect(assignSpy).not.toHaveBeenCalled();
      expect(deleteDraftSpy).not.toHaveBeenCalled();
    });

    it('on error should redirect to dashboard', async () => {
      getFirstContactDataSpy.mockReturnValue({claimId: '123'});
      getClaimByIdSpy.mockRejectedValue(new Error('Test error'));

      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
    });

    it('on success should redirect to dashboard', async () => {
      getFirstContactDataSpy.mockReturnValue({claimId: '123'});

      await request(app).get(ASSIGN_CLAIM_URL)
        .expect(302)
        .expect('Location', DASHBOARD_URL);
    });
  });
});
