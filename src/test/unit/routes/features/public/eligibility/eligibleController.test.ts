import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

describe('You can use this service', () => {

  describe('on GET', () => {
    it('should return you can use this service page', async () => {
      await request(app)
        .get(ELIGIBILITY_HWF_ELIGIBLE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You can use this service');
        });
    });
  });

  describe('on GET with language and eligibility cookie variations', () => {
    it('should use language from the query string', async () => {
      await request(app)
        .get(ELIGIBILITY_HWF_ELIGIBLE_URL)
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should not set the eligibility cookie again when it is already present', async () => {
      await request(app)
        .get(ELIGIBILITY_HWF_ELIGIBLE_URL)
        .set('Cookie', ['eligibilityCompleted=true'])
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You can use this service');
        });
    });
  });

  describe('on POST', () => {
    it('should return page not found', async () => {
      await request(app)
        .post(ELIGIBILITY_HWF_ELIGIBLE_URL)
        .expect((res) => {
          expect(res.status).toBe(404);
          expect(res.text).toContain(TestMessages.PAGE_NOT_FOUND);
        });
    });
  });

  describe('on GET', () => {
    it('should return you can use this service page', async () => {
      await request(app)
        .get(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You can use this service');
        });
    });
  });

  describe('on POST', () => {
    it('should return page not found', async () => {
      await request(app)
        .post(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(404);
          expect(res.text).toContain(TestMessages.PAGE_NOT_FOUND);
        });
    });
  });

  describe('on GET', () => {
    it('should return you can use this service page', async () => {
      await request(app)
        .get(ELIGIBLE_FOR_THIS_SERVICE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You can use this service');
        });
    });
  });

  describe('on POST', () => {
    it('should return page not found', async () => {
      await request(app)
        .post(ELIGIBLE_FOR_THIS_SERVICE_URL)
        .expect((res) => {
          expect(res.status).toBe(404);
          expect(res.text).toContain(TestMessages.PAGE_NOT_FOUND);
        });
    });
  });
});
