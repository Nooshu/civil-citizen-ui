import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {RedisStore} from 'connect-redis';
import {app} from '../../../../../main/app';
import {CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as contactThemService from 'services/features/response/contactThem/contactThemService';
import {Address} from 'form/models/address';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce({} as RedisStore);
  });
  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('claimant');
          expect(res.text).toContain('Address');
          expect(res.text).toContain('Phone:');
          expect(res.text).toContain('Contact us for help');
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.partyName);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine1);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine2);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine3);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.postCode);
        });
    });

    it('should return defendant contact details when the user is a claimant', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data, {caseRole: CaseRole.CLAIMANT});
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .query({lang: 'en'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Defendant');
        });
    });

    it('should return claimant contact details when the user is a defendant', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data, {caseRole: CaseRole.DEFENDANT});
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .set('Cookie', ['lang=cy'])
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    // The address/solicitor helpers dereference the claim, so they are stubbed to keep the
    // request on the happy path while the controller's `claim?.` fallbacks are exercised.
    it('should render without party details when no claim is returned', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(undefined);
      jest.spyOn(contactThemService, 'getAddress').mockReturnValueOnce(new Address());
      jest.spyOn(contactThemService, 'getSolicitorName').mockReturnValueOnce(undefined);

      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Contact us for help');
        });
    });

    it('should return 500 when claim lookup fails', async () => {
      (getClaimById as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
