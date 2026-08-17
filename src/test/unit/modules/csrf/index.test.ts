import {Request, Response, NextFunction} from 'express';
import {CSRFToken} from 'modules/csrf';
import {isTestingSupportDraftUrl} from 'modules/oidc';

jest.mock('modules/oidc', () => ({
  isTestingSupportDraftUrl: jest.fn(),
}));

jest.mock('@dr.pogodin/csurf', () => {
  return jest.fn(() => {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  });
});

const mockIsTestingSupportDraftUrl = isTestingSupportDraftUrl as jest.Mock;

describe('CSRFToken', () => {
  let middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    middlewares = [];
    const app = {
      use: (mw: (req: Request, res: Response, next: NextFunction) => void) => {
        middlewares.push(mw);
      },
    };
    new CSRFToken().enableFor(app as never);
    next = jest.fn();
    res = {locals: {}};
    mockIsTestingSupportDraftUrl.mockReturnValue(false);
  });

  it('skips csurf for eligibility paths', () => {
    req = {path: '/eligibility/claim-value', originalUrl: '/eligibility/claim-value'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('skips csurf for first-contact paths', () => {
    req = {path: '/first-contact/claim-reference', originalUrl: '/first-contact/claim-reference'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('skips csurf for testing-support draft URLs', () => {
    mockIsTestingSupportDraftUrl.mockReturnValue(true);
    req = {path: '/testing-support/create-draft-claim', originalUrl: '/testing-support/create-draft-claim'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('applies csurf for protected paths', () => {
    req = {path: '/dashboard', originalUrl: '/dashboard'};
    middlewares[0](req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('sets csrf token on locals for protected paths', () => {
    req = {
      path: '/dashboard',
      originalUrl: '/dashboard',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBe('csrf-token');
    expect(next).toHaveBeenCalled();
  });

  it('does not set csrf token for eligibility paths', () => {
    req = {
      path: '/eligibility/claim-value',
      originalUrl: '/eligibility/claim-value',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('does not set csrf token for testing-support draft URLs', () => {
    mockIsTestingSupportDraftUrl.mockReturnValue(true);
    req = {
      path: '/testing-support/create-draft-claim',
      originalUrl: '/testing-support/create-draft-claim',
      csrfToken: jest.fn().mockReturnValue('csrf-token'),
    };
    middlewares[1](req as Request, res as Response, next);
    expect(res.locals!.csrf).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
