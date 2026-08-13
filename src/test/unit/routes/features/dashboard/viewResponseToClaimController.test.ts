import config from 'config';
import nock from 'nock';
import {VIEW_RESPONSE_TO_CLAIM} from 'routes/urls';
import request from 'supertest';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';

import {app} from '../../../../../main/app';
import {CaseRole} from 'form/models/caseRoles';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'form/models/responseType';

jest.mock('../../../../../main/modules/oidc');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '123';
const baseClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');

function claimWithResponseType(responseType: ResponseType | undefined) {
  const claim = JSON.parse(JSON.stringify(baseClaim));
  claim.case_data.respondent1ClaimResponseTypeForSpec = responseType;
  return claim;
}

describe('view response to claim controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    nock.cleanAll();
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.DEFENDANT]);
  });

  describe('on Get', () => {
    it.each([
      [ResponseType.PART_ADMISSION, 'Admit part of the claim'],
      [ResponseType.FULL_ADMISSION, 'Admit all of the claim'],
      [ResponseType.FULL_DEFENCE, 'Reject all of the claim'],
      [ResponseType.COUNTER_CLAIM, 'Reject all of the claim and counterclaim'],
    ])('should render response type %s', async (responseType, expectedLabel) => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithResponseType(responseType));

      await request(app)
        .get(VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the response to the claim');
          expect(res.text).toContain(expectedLabel);
        });
    });

    it('should view the response to the claim without a response type', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithResponseType(undefined));

      await request(app)
        .get(VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View the response to the claim');
        });
    });

    it('should return http 500 when has error', async () => {
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);

      await request(app)
        .get(VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
