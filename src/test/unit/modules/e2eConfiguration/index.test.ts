import {Application} from 'express';
import RedisStore from 'connect-redis';
import {LoggerInstance} from 'winston';
import {DraftStoreCliente2e, getRedisStoreForSessione2e} from 'modules/e2eConfiguration';

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
      expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/UI Preview mock data .* saved to Redis/));

      const seeded = await draftClient.get('1645882162449601someID');
      expect(seeded).toContain('FULL_ADMISSION');
    });
  });

  describe('getRedisStoreForSessione2e', () => {
    it('returns a Redis-backed session store for e2e', () => {
      const store = getRedisStoreForSessione2e();

      expect(store).toBeInstanceOf(RedisStore);
    });
  });
});
