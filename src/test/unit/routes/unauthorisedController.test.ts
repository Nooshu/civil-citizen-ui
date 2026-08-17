import request from 'supertest';
import {app} from '../../../main/app';
import {UNAUTHORISED_URL} from 'routes/urls';

jest.mock('../../../main/modules/oidc');
jest.mock('../../../main/modules/draft-store');

describe('Unauthorised Controller', () => {
  describe('on GET', () => {
    it('should render unauthorised page successfully', async () => {
      await request(app)
        .get(UNAUTHORISED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unauthorised');
        });
    });
  });
});
