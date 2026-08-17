import request from 'supertest';
import {app} from '../../../main/app';
import {HOME_URL} from 'routes/urls';

jest.mock('../../../main/modules/oidc');
jest.mock('../../../main/modules/draft-store');

describe('Home Controller', () => {
  describe('on GET', () => {
    it('should render home page successfully', async () => {
      await request(app)
        .get(HOME_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
});
