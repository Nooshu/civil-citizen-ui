import {Application} from 'express';
import {LoggerInstance} from 'winston';
import RedisStore from 'connect-redis';

const Redis = require('ioredis-mock');

const REDIS_DATA = require('./redisData.json');
const GA_REDIS_DATA = require('./gaRedisData.json');
const UI_PREVIEW_REDIS_DATA = require('./uiPreviewRedisData.json');
const ONE_DAY_IN_SECONDS = 86400;

/**
 * Seeds in-memory Redis for `NODE_ENV=e2eTest` (mocked functional tests and UI Preview).
 *
 * @remarks
 * UI Preview extra claims live in `uiPreviewRedisData.json` and are keyed `{claimId}someID`.
 * Do not copy those fixtures into Helm chart WireMock.
 */
export class DraftStoreCliente2e {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully e2e tests';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    const client = new Redis();

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreCliente2e.REDIS_CONNECTION_SUCCESS);

    app.locals.draftStoreClient.on('connect', () => {
      REDIS_DATA.forEach((element: any) => {
        element.case_data.draftClaimCreatedAt = Date.now();
        client.set(element.id, JSON.stringify(element, null, 4)).then(() => {
          this.logger.info(`Mock data ${element.id} saved to Redis`);
          return client.expire(element.id, ONE_DAY_IN_SECONDS);
        });
      });
      GA_REDIS_DATA.forEach((element: any) => {
        client.set(element.id, JSON.stringify(element.value, null, 4)).then(() => {
          this.logger.info(`Mock data ${element.id} saved to Redis`);
          return client.expire(element.id, ONE_DAY_IN_SECONDS);
        });
      });
      UI_PREVIEW_REDIS_DATA.forEach((element: any) => {
        client.set(element.id, JSON.stringify(element, null, 4)).then(() => {
          this.logger.info(`UI Preview mock data ${element.id} saved to Redis`);
          return client.expire(element.id, ONE_DAY_IN_SECONDS);
        });
      });
    });
  }
}

export const getRedisStoreForSessione2e = () => {
  return new RedisStore({
    client: new Redis(),
    prefix: 'citizen-ui-session:',
    ttl: ONE_DAY_IN_SECONDS, //prune expired entries every 24h
  });
};
