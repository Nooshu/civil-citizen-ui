import {Application} from 'express';
import {LoggerInstance} from 'winston';
import {DraftStoreCliente2e, getRedisStoreForSessione2e} from 'modules/e2eConfiguration';

jest.mock('connect-redis', () => {
  return jest.fn().mockImplementation((options) => ({options, type: 'redis-store'}));
});

describe('e2eConfiguration', () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as unknown as LoggerInstance;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DraftStoreCliente2e', () => {
    it('seeds Redis mock data when the client connects', async () => {
      const app = {locals: {}} as Application;
      const client = new DraftStoreCliente2e(logger);

      client.enableFor(app);

      expect(app.locals.draftStoreClient).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(DraftStoreCliente2e.REDIS_CONNECTION_SUCCESS);

      const draftClient = app.locals.draftStoreClient as {
        emit: (event: string) => void;
        get: (key: string) => Promise<string | null>;
      };

      draftClient.emit('connect');

      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/Mock data .* saved to Redis/));
    });
  });

  describe('getRedisStoreForSessione2e', () => {
    it('returns a RedisStore configured for citizen UI sessions', () => {
      const store = getRedisStoreForSessione2e() as {options: {prefix: string; ttl: number}; type: string};

      expect(store.type).toBe('redis-store');
      expect(store.options.prefix).toBe('citizen-ui-session:');
      expect(store.options.ttl).toBe(86400);
    });
  });
});
