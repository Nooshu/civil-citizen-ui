import {Request, RequestHandler, Response} from 'express';
import {app} from '../../../../../../main/app';
import {mockCivilClaimFastTrack, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PAY_HEARING_FEE_URL} from 'routes/urls';
import {FIXED_DATE} from '../../../../../utils/dateUtils';
import {CaseRole} from 'form/models/caseRoles';
import {CivilServiceClient} from 'client/civilServiceClient';
import payHearingFeeStartScreenController from 'routes/features/caseProgression/hearingFee/payHearingFeeStartScreenController';

const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
describe('Pay Hearing Fee Start Screen Controller', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  claim.case_data.
    hearingFee ={
      calculatedAmountInPence: '1000', code: 'test', version: '1',
    };
  claim.case_data.hearingDueDate = FIXED_DATE;

  const claimId = claim.id;

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

  beforeAll((done) => {
    testSession
      .get('/oauth2/callback')
      .query('code=ABCD')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
  });
  it('should return expected pay hearing fee page when claim exists', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId)
      .reply(200, claim);
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.CLAIMANT]);
    //When
    await testSession.get(PAY_HEARING_FEE_URL.replace(':id', claimId))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE'));
      });
  });

  it('should use language from the query string', async () => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId)
      .reply(200, claim);
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.CLAIMANT]);
    await testSession
      .get(PAY_HEARING_FEE_URL.replace(':id', claimId))
      .query({lang: 'cy'})
      .expect((res: { status: unknown }) => {
        expect(res.status).toBe(200);
      });
  });

  it('should use defendant dashboard url when case role is defendant', async () => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId)
      .reply(200, claim);
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.DEFENDANT]);
    await testSession
      .get(PAY_HEARING_FEE_URL.replace(':id', claimId))
      .expect((res: { status: unknown; text: string }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(`/dashboard/${claimId}/defendant`);
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given — reset language so the English error page is asserted after any Welsh query tests
    app.request.cookies = {lang: 'en'};
    app.locals.draftStoreClient = mockRedisFailure;
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(404, null);

    //When
    await testSession.get(PAY_HEARING_FEE_URL.replace(':id', '1111'))
      .query({lang: 'en'})
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should pass error with status 500 to next when civil service responds with 404', async () => {
    const controllerStack = (payHearingFeeStartScreenController as unknown as {stack: Array<any>}).stack;
    const routeLayer = controllerStack.find((layer) => layer.route?.path === PAY_HEARING_FEE_URL);
    expect(routeLayer).toBeDefined();
    const handler = routeLayer.route.stack[0].handle as RequestHandler;

    const axiosError: {response: {status: number}; status?: number} = {response: {status: 404}};
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(axiosError);

    const req = {params: {id: '999'}, cookies: {}, query: {}} as unknown as Request;
    const res = {render: jest.fn()} as unknown as Response;
    const next = jest.fn();

    await handler(req, res, next);

    expect(axiosError.status).toBe(500);
    expect(next).toHaveBeenCalledWith(axiosError);
  });

  it('should leave non-404 errors unchanged when passing them to next', async () => {
    const controllerStack = (payHearingFeeStartScreenController as unknown as {stack: Array<any>}).stack;
    const routeLayer = controllerStack.find((layer) => layer.route?.path === PAY_HEARING_FEE_URL);
    const handler = routeLayer.route.stack[0].handle as RequestHandler;
    const axiosError: {response: {status: number}; status?: number} = {response: {status: 503}};
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(axiosError);
    const next = jest.fn();
    await handler({params: {id: '999'}, cookies: {}, query: {}} as unknown as Request, {render: jest.fn()} as unknown as Response, next);
    expect(axiosError.status).toBeUndefined();
    expect(next).toHaveBeenCalledWith(axiosError);
  });

  it('should pass through errors that have no response status', async () => {
    const controllerStack = (payHearingFeeStartScreenController as unknown as {stack: Array<any>}).stack;
    const routeLayer = controllerStack.find((layer) => layer.route?.path === PAY_HEARING_FEE_URL);
    const handler = routeLayer.route.stack[0].handle as RequestHandler;
    const plainError = new Error('network down');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(plainError);
    const next = jest.fn();
    await handler({params: {id: '999'}, cookies: {}, query: {}} as unknown as Request, {render: jest.fn()} as unknown as Response, next);
    expect(next).toHaveBeenCalledWith(plainError);
  });
});
