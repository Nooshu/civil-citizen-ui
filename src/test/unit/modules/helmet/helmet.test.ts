import express from 'express';
import {AppRequest} from 'common/models/AppRequest';

const dynatraceUrlState = {value: 'https://js-cdn.dynatrace.com/script.js'};
const helmetCalls: unknown[] = [];

jest.mock('config', () => {
  const actual = jest.requireActual('config');
  return {
    __esModule: true,
    default: {
      get: (key: string) => {
        if (key === 'services.dynatrace.url') {
          return dynatraceUrlState.value;
        }
        return actual.get(key);
      },
    },
  };
});

jest.mock('helmet', () => ({
  __esModule: true,
  default: jest.fn((opts: unknown) => {
    helmetCalls.push(opts);
    return (_req: unknown, _res: unknown, next: (err?: unknown) => void) => next();
  }),
}));

// Import after mocks so Helmet reads mocked config/helmet.
import {Helmet} from 'modules/helmet';

describe('Helmet module', () => {
  beforeEach(() => {
    helmetCalls.length = 0;
    dynatraceUrlState.value = 'https://js-cdn.dynatrace.com/script.js';
  });

  it('should throw when referrer policy is missing', () => {
    const app = express();
    expect(() => new Helmet({} as never).enableFor(app)).toThrow(
      'Referrer policy configuration is required',
    );
  });

  it('should enable helmet CSP and invoke nonce directive callbacks', () => {
    const app = express();
    const useSpy = jest.spyOn(app, 'use');

    new Helmet({referrerPolicy: 'strict-origin-when-cross-origin'} as never).enableFor(app);

    expect(helmetCalls.length).toBeGreaterThanOrEqual(2);
    const cspConfig = helmetCalls.find(
      (call): call is {contentSecurityPolicy: {directives: Record<string, unknown[]>}} =>
        Boolean((call as {contentSecurityPolicy?: unknown})?.contentSecurityPolicy),
    );
    expect(cspConfig).toBeDefined();

    const req = {cookies: {nonceValue: 'nv', nonceDataLayer: 'ndl'}} as unknown as AppRequest;
    const res = {locals: {nonceWebChat: 'nwc'}} as unknown as express.Response;

    const invokeStringFns = (entries: unknown[] = []) => {
      for (const entry of entries) {
        if (typeof entry === 'function') {
          expect(entry(req, res)).toContain('nonce-');
        }
      }
    };

    const directives = cspConfig!.contentSecurityPolicy.directives;
    invokeStringFns(directives.scriptSrc as unknown[]);
    invokeStringFns(directives.scriptSrcElem as unknown[]);
    invokeStringFns(directives.imgSrc as unknown[]);

    expect(useSpy).toHaveBeenCalled();
  });

  it('should mount dynatrace CORS middleware for app-local paths', () => {
    dynatraceUrlState.value = '/dynatrace-local';
    const app = express();
    const useSpy = jest.spyOn(app, 'use');

    new Helmet({referrerPolicy: 'strict-origin-when-cross-origin'} as never).enableFor(app);

    const corsMount = useSpy.mock.calls.find(([path]) => path === '/dynatrace-local');
    expect(corsMount).toBeDefined();
    const corsHandler = corsMount?.[1] as express.RequestHandler;

    const headers: Record<string, string> = {};
    const res = {
      header: (name: string, value: string) => {
        headers[name] = value;
      },
    } as unknown as express.Response;
    const next = jest.fn();
    corsHandler({} as express.Request, res, next);

    expect(headers['Access-Control-Allow-Origin']).toBe('*');
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
    expect(headers['Access-Control-Allow-Headers']).toContain('Authorization');
    expect(next).toHaveBeenCalled();
  });

  it('should skip dynatrace CORS mount for absolute URLs', () => {
    dynatraceUrlState.value = 'https://js-cdn.dynatrace.com/script.js';
    const app = express();
    const useSpy = jest.spyOn(app, 'use');

    new Helmet({referrerPolicy: 'strict-origin-when-cross-origin'} as never).enableFor(app);

    expect(useSpy.mock.calls.some(([path]) => typeof path === 'string' && path.startsWith('https://'))).toBe(false);
  });
});
