import config from 'config';
import {Application} from 'express';
import {LoggerInstance} from 'winston';

const Redis = require('ioredis');

const REDIS_DATA = require('./redisData.json');
const ONE_DAY_IN_SECONDS = 86400;

export class DraftStoreClient {
  public static REDIS_CONNECTION_SUCCESS = 'Connected to Redis instance successfully';

  constructor(private readonly logger: LoggerInstance) {
  }

  public enableFor(app: Application): void {
    const protocol = config.get('services.draftStore.redis.tls') ? 'rediss://' : 'redis://';
    const host = config.get<string>('services.draftStore.redis.host');
    const port = config.get<string | number>('services.draftStore.redis.port');
    const key = config.get<string>('services.draftStore.redis.key');
    // Local Redis has no password; only include credentials when a key is configured.
    const connectionString = key
      ? `${protocol}:${key}@${host}:${port}`
      : `${protocol}${host}:${port}`;
    const client = new Redis(connectionString);
    // Without an error listener, connection failures become "[ioredis] Unhandled error event".
    client.on('error', (err: Error) => {
      this.logger.error(`Redis draft store connection error (${host}:${port})`, err);
    });

    app.locals.draftStoreClient = client;
    this.logger.info(DraftStoreClient.REDIS_CONNECTION_SUCCESS);

    if(process.env.NODE_ENV !== 'production') {
      app.locals.draftStoreClient.on('connect', () => {
        REDIS_DATA.forEach((element: any) => {
          client.set(element.id, JSON.stringify(element, null, 4)).then(() => {
            this.logger.info(`Mock data ${element.id} saved to Redis`);
            return client.expire(element.id, ONE_DAY_IN_SECONDS);
          });
        });
      });
    }
  }
}
