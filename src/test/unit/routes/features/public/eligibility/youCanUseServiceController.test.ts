import express, {Express} from 'express';
import youCanUseServiceController from 'routes/features/public/eligibility/youCanUseServiceController';
import {ELIGIBLE_FOR_THIS_SERVICE_URL, SIGN_IN_URL} from 'routes/urls';
import request from 'supertest';

describe('youCanUseServiceController', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use((req, res, next) => {
      res.render = (view: string, options?: Record<string, unknown>) => {
        res.status(200).json({view, options});
      };
      next();
    });
    app.use(youCanUseServiceController);
  });

  it('renders the you can use this service page with sign-in next step', async () => {
    const res = await request(app).get(ELIGIBLE_FOR_THIS_SERVICE_URL);

    expect(res.status).toBe(200);
    expect(res.body.view).toBe('features/public/eligibility/you-can-use-service');
    expect(res.body.options).toEqual({
      urlNextView: SIGN_IN_URL,
      pageTitle: 'PAGES.YOU_CAN_USE_SERVICE.PAGE_TITLE',
    });
  });
});
