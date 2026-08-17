import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuard';
import {generatePcqUrl, isPcqElegible, isPcqHealthy} from 'client/pcq/pcqClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {savePcqId} from 'client/pcq/savePcqIdClaim';
import {Email} from 'models/Email';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('client/pcq/pcqClient', () => ({
  isPcqHealthy: jest.fn().mockResolvedValue(false),
  isPcqElegible: jest.fn(),
  generatePcqUrl: jest.fn(),
}));
jest.mock('client/pcq/generatePcqId', () => ({
  generatePcqId: jest.fn().mockReturnValue('new-pcq-id'),
}));
jest.mock('client/pcq/savePcqIdClaim', () => ({
  savePcqId: jest.fn().mockResolvedValue(undefined),
}));

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockIsPcqShutterOn = isPcqShutterOn as jest.Mock;
const mockIsPcqHealthy = isPcqHealthy as jest.Mock;
const mockIsPcqElegible = isPcqElegible as jest.Mock;
const mockGeneratePcqUrl = generatePcqUrl as jest.Mock;
const mockGeneratePcqId = generatePcqId as jest.Mock;
const mockSavePcqId = savePcqId as jest.Mock;

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('pcqGuard', () => {
  const mockClaim = new Claim();
  mockClaim.respondentResponsePcqId = 'existing-pcq-id';
  mockClaim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    emailAddress: new Email('defendant@example.com'),
  } as Claim['respondent1'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPcqShutterOn.mockResolvedValue(false);
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
  });

  it('should stash claim on req.locals and call next when PCQ id already exists', async () => {
    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should use stashed claim without a second Redis read', async () => {
    const stashedClaim = new Claim();
    stashedClaim.respondentResponsePcqId = 'existing-pcq-id';
    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
      locals: {env: '', lang: '', claim: stashedClaim},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
    expect((<AppRequest>req).locals.claim).toBe(stashedClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect to PCQ using language from the query string', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.respondent1 = {
      type: PartyType.INDIVIDUAL,
      emailAddress: new Email('defendant@example.com'),
    } as Claim['respondent1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');

    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {lang: 'cy'},
      cookies: {},
      headers: {host: 'localhost:3001'},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqId).toHaveBeenCalled();
    expect(mockSavePcqId).toHaveBeenCalled();
    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'respondent',
      'defendant@example.com',
      'localhost:3001/case/123/response/check-and-send',
      'cy',
      '123',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
  });

  it('should redirect to PCQ using language from cookie when query is absent', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.respondent1 = {
      type: PartyType.INDIVIDUAL,
      emailAddress: new Email('defendant@example.com'),
    } as Claim['respondent1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');

    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {lang: 'en'},
      headers: {host: 'localhost:3001'},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'respondent',
      'defendant@example.com',
      'localhost:3001/case/123/response/check-and-send',
      'en',
      '123',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
  });

  it('should redirect to PCQ without a defendant email when none is stored', async () => {
    const claimWithoutEmail = new Claim();
    claimWithoutEmail.respondent1 = {type: PartyType.INDIVIDUAL} as Claim['respondent1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutEmail);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');

    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {lang: 'en'},
      headers: {host: 'localhost:3001'},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'respondent',
      undefined,
      'localhost:3001/case/123/response/check-and-send',
      'en',
      '123',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
  });

  it('should call next without redirecting when PCQ is unhealthy', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.respondent1 = {
      type: PartyType.INDIVIDUAL,
      emailAddress: new Email('defendant@example.com'),
    } as Claim['respondent1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(false);
    mockIsPcqElegible.mockReturnValue(true);

    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {host: 'localhost:3001'},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqId).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should forward errors to next', async () => {
    mockGetCaseDataFromStore.mockRejectedValue(new Error('boom'));

    const req = {
      method: 'GET',
      originalUrl: '/case/123/response/check-and-send',
      query: {},
      cookies: {},
      headers: {},
      params: {id: '123'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(expect.any(Error));
  });
});
