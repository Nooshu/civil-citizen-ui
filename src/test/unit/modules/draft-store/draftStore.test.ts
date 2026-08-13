import {DraftStoreClient} from 'modules/draft-store';
import {LoggerInstance} from 'winston';
import express from 'express';
import config from 'config';

type RedisHandler = (...args: unknown[]) => void;

const Redis = require('ioredis');

const createMockRedis = () => {
  const handlers = new Map<string, RedisHandler[]>();
  return {
    ping: jest.fn(async () => 'PONG'),
    set: jest.fn(async () => undefined),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn(() => Promise.resolve(-1)),
    expireat: jest.fn(() => Promise.resolve({})),
    on: jest.fn((event: string, handler: RedisHandler) => {
      const list = handlers.get(event) || [];
      list.push(handler);
      handlers.set(event, list);
      return undefined;
    }),
    emit(event: string, ...args: unknown[]) {
      for (const handler of handlers.get(event) || []) {
        handler(...args);
      }
    },
  };
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => createMockRedis());
});

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

const app: express.Application = {
  locals: {
    draftStoreClient: null,
  },
} as unknown as express.Application;

describe('Draft Store Client', () => {
  let originalEnv: string | undefined;
  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('Upon successful connection to Redis, log info message', async () => {
    const draftStoreClient: DraftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    await new Promise(process.nextTick);
    expect(mockLogger.info).toHaveBeenCalledWith(DraftStoreClient.REDIS_CONNECTION_SUCCESS);
    expect(app.locals.draftStoreClient.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('logs Redis connection errors via the error listener', () => {
    process.env.NODE_ENV = 'test';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    const err = new Error('connection refused');
    app.locals.draftStoreClient.emit('error', err);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Redis draft store connection error'),
      err,
    );
  });

  it('builds a rediss URL with credentials when tls and key are configured', () => {
    process.env.NODE_ENV = 'test';
    jest.spyOn(config, 'get').mockImplementation(((path: string) => {
      switch (path) {
        case 'services.draftStore.redis.tls':
          return true;
        case 'services.draftStore.redis.host':
          return 'redis.example';
        case 'services.draftStore.redis.port':
          return 6380;
        case 'services.draftStore.redis.key':
          return 'secret';
        default:
          return undefined;
      }
    }) as typeof config.get);

    new DraftStoreClient(mockLogger).enableFor(app);

    expect(Redis).toHaveBeenCalledWith('rediss://:secret@redis.example:6380');
  });

  it('should register the "connect" listener and seed data if NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    const mockRedisClient = app.locals.draftStoreClient;
    expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));

    mockRedisClient.emit('connect');
    await new Promise(process.nextTick);

    expect(mockRedisClient.set).toHaveBeenCalled();
    expect(mockRedisClient.expire).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringMatching(/Mock data .+ saved to Redis/));
  });

  it('should NOT register the "connect" listener or seed data if NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    expect(app.locals.draftStoreClient.on).not.toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should NOT register the "connect" listener or seed data if NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    expect(app.locals.draftStoreClient.on).not.toHaveBeenCalledWith('connect', expect.any(Function));
  });
});
