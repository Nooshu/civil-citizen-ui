import {NextFunction, RequestHandler, Response} from 'express';
import {ipKeyGenerator, rateLimit} from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import type {RedisReply} from 'rate-limit-redis';
import {AppRequest} from 'models/AppRequest';
import {HTTPError} from '../../HttpError';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadRateLimitGuard');

interface RedisRateLimitClient {
  call?: (command: string, ...args: string[]) => Promise<RedisReply>;
  [command: string]: unknown;
}

/**
 * Runs a Redis command on the draft-store client.
 *
 * @remarks
 * Production uses ioredis `.call`. UI Preview / e2eTest uses `ioredis-mock`, which has no `.call`
 * (rate-limit-redis then fails store init and POSTs to upload URLs 500). Fall back to the command
 * name as a method (`GET`, `INCR`, `SCRIPT`, …) when `.call` is missing.
 */
export const sendRedisCommand = (redisClient: RedisRateLimitClient, command: string, ...args: string[]): Promise<RedisReply> => {
  if (typeof redisClient.call === 'function') {
    return redisClient.call(command, ...args);
  }
  const method = command.toLowerCase();
  const fn = redisClient[method];
  if (typeof fn === 'function') {
    return (fn as (...commandArgs: string[]) => Promise<RedisReply>)(...args);
  }
  return Promise.reject(new Error(`Redis client cannot run ${command}`));
};

const buildRateLimitKey = (req: AppRequest): string => {
  if (req.session?.user?.id) {
    return `user:${req.session.user.id}`;
  }

  if (req.sessionID) {
    return `session:${req.sessionID}`;
  }

  if (req.ip) {
    return `ip:${ipKeyGenerator(req.ip)}`;
  }

  return 'unknown';
};

const buildRateLimitError = (): HTTPError => {
  const error = new HTTPError();
  error.status = 429;
  error.message = 'Too many upload requests. Please wait and try again.';
  return error;
};

export const createUploadRateLimitGuard = (
  maxRequests: number,
  windowMs: number,
  redisClient: RedisRateLimitClient,
): RequestHandler => rateLimit({
  windowMs,
  limit: maxRequests,
  skip: req => req.method !== 'POST',
  keyGenerator: req => buildRateLimitKey(req as AppRequest),
  store: new RedisStore({
    prefix: 'upload-rate-limit:',
    sendCommand: (command: string, ...args: string[]) => sendRedisCommand(redisClient, command, ...args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res: Response, next: NextFunction) => {
    const rateLimit = (req as typeof req & { rateLimit?: { used: number; resetTime?: Date } }).rateLimit;
    const retryAfterSeconds = rateLimit?.resetTime
      ? Math.max(1, Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000))
      : Math.max(1, Math.ceil(windowMs / 1000));

    res.setHeader('Retry-After', retryAfterSeconds.toString());
    logger.warn(`Upload rate limit exceeded for ${buildRateLimitKey(req as AppRequest)}, count ${rateLimit?.used || maxRequests + 1}, retry after ${retryAfterSeconds}s`);
    next(buildRateLimitError());
  },
  passOnStoreError: false,
  logger: {
    warn: (error: unknown, message?: string) => logger.warn(message || error),
    error: (error: unknown, message?: string) => logger.error(message || 'Upload rate limit check failed', error),
  },
});
