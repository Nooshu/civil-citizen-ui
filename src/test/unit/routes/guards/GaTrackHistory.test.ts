import {Response, NextFunction} from 'express';
import {GaTrackHistory} from 'routes/guards/GaTrackHistory';
import {AppRequest} from 'models/AppRequest';
import {BACK_URL} from 'routes/urls';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('GaTrackHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not save url when originalUrl is undefined', async () => {
    const MOCK_REQUEST = {
      originalUrl: undefined,
      session: {history: []},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual([]);
  });

  it('should not store history when url is BACK_URL', async () => {
    const MOCK_REQUEST = {
      originalUrl: BACK_URL,
      session: {history: []},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history.length).toEqual(0);
  });

  it('should track history when url is given', async () => {
    const MOCK_REQUEST = {
      originalUrl: '/test/test',
      session: {history: []},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual(['/test/test']);
  });

  it('should create a new history array when session history is undefined', async () => {
    const MOCK_REQUEST = {
      originalUrl: '/test/test',
      session: {},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual(['/test/test']);
  });

  it('should push url with query params on first visit', async () => {
    const MOCK_REQUEST = {
      originalUrl: '/test/test?lang=en',
      session: {},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual(['/test/test?lang=en']);
  });

  it('should not duplicate history when path matches ignoring query params', async () => {
    const MOCK_REQUEST = {
      originalUrl: '/upload?file=2',
      session: {history: ['/upload?file=1']},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual(['/upload?file=1']);
  });

  it('should push a different path onto history', async () => {
    const MOCK_REQUEST = {
      originalUrl: '/next-page',
      session: {history: ['/previous-page']},
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_REQUEST.session.history).toEqual(['/previous-page', '/next-page']);
  });

  it('should call next with error when session access throws', async () => {
    const error = new Error('session failure');
    const MOCK_REQUEST = {
      originalUrl: '/test/test',
      get session() {
        throw error;
      },
    } as unknown as AppRequest;

    await GaTrackHistory(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(error);
  });
});
