import request from 'supertest';
import {app} from '../../../../../main/app';
import {UI_PREVIEW_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('UI Preview controller', () => {
  it('should render the page catalogue', async () => {
    await request(app)
      .get(UI_PREVIEW_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('UI Preview');
        expect(res.text).toContain('Browse journeys');
        expect(res.text).toContain('Privacy policy');
      });
  });
});
