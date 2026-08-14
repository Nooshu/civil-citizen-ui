import {NextFunction, Request, Response} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isPcqShutterOn} from 'app/auth/launchdarkly/launchDarklyClient';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';
import {generatePcqUrl, isPcqElegible, isPcqHealthy} from 'client/pcq/pcqClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {CLAIM_CHECK_ANSWERS_URL} from 'routes/urls';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/services/translation/response/claimantIdamDetails');
jest.mock('client/pcq/pcqClient', () => ({
  isPcqHealthy: jest.fn().mockResolvedValue(false),
  isPcqElegible: jest.fn(),
  generatePcqUrl: jest.fn(),
}));
jest.mock('client/pcq/generatePcqId', () => ({
  generatePcqId: jest.fn().mockReturnValue('new-pcq-id'),
}));
jest.mock('client/pcq/savePcqIdClaim', () => ({
  savePcqIdClaim: jest.fn().mockResolvedValue(undefined),
}));

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockIsPcqShutterOn = isPcqShutterOn as jest.Mock;
const mockGetClaimantIdamDetails = getClaimantIdamDetails as jest.Mock;
const mockIsPcqHealthy = isPcqHealthy as jest.Mock;
const mockIsPcqElegible = isPcqElegible as jest.Mock;
const mockGeneratePcqUrl = generatePcqUrl as jest.Mock;
const mockGeneratePcqId = generatePcqId as jest.Mock;
const mockSavePcqIdClaim = savePcqIdClaim as jest.Mock;

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('pcqGuardClaim', () => {
  const mockClaim = new Claim();
  mockClaim.pcqId = 'existing-pcq-id';
  mockClaim.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPcqShutterOn.mockResolvedValue(false);
    mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
    mockGetClaimantIdamDetails.mockReturnValue({email: 'claimant@example.com'});
  });

  it('should stash claim on req.locals and call next when PCQ id already exists', async () => {
    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).toHaveBeenCalledTimes(1);
    expect((<AppRequest>req).locals.claim).toBe(mockClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should use stashed claim without a second Redis read', async () => {
    const stashedClaim = new Claim();
    stashedClaim.pcqId = 'existing-pcq-id';
    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
      locals: {env: '', lang: '', claim: stashedClaim},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetCaseDataFromStore).not.toHaveBeenCalled();
    expect((<AppRequest>req).locals.claim).toBe(stashedClaim);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next when PCQ shutter is on', async () => {
    mockIsPcqShutterOn.mockResolvedValue(true);
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);

    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to PCQ when healthy and eligible', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');

    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {lang: 'cy'},
      cookies: {},
      headers: {host: 'localhost:3001'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqId).toHaveBeenCalled();
    expect(mockSavePcqIdClaim).toHaveBeenCalledWith('new-pcq-id', 'user-1');
    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'applicant',
      'claimant@example.com',
      `localhost:3001${CLAIM_CHECK_ANSWERS_URL}`,
      'cy',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should use language from cookie when redirecting to PCQ', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.applicant1 = {type: PartyType.INDIVIDUAL} as Claim['applicant1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(true);
    mockGeneratePcqUrl.mockReturnValue('https://pcq.example/start');

    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {lang: 'en'},
      headers: {host: 'localhost:3001'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGeneratePcqUrl).toHaveBeenCalledWith(
      'new-pcq-id',
      'applicant',
      'claimant@example.com',
      `localhost:3001${CLAIM_CHECK_ANSWERS_URL}`,
      'en',
    );
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith('https://pcq.example/start');
  });

  it('should call next when PCQ is unhealthy or ineligible', async () => {
    const claimWithoutPcq = new Claim();
    claimWithoutPcq.applicant1 = {type: PartyType.ORGANISATION} as Claim['applicant1'];
    mockGetCaseDataFromStore.mockResolvedValue(claimWithoutPcq);
    mockIsPcqHealthy.mockResolvedValue(true);
    mockIsPcqElegible.mockReturnValue(false);

    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {lang: 'en'},
      headers: {host: 'localhost:3001'},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('should forward errors to next', async () => {
    mockGetCaseDataFromStore.mockRejectedValue(new Error('boom'));

    const req = {
      method: 'GET',
      originalUrl: '/claim/check-answers',
      query: {},
      cookies: {},
      headers: {},
      session: {user: {id: 'user-1'}},
    } as unknown as Request;

    await isFirstTimeInPCQ(req as unknown as AppRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(expect.any(Error));
  });
});
