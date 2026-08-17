import request from 'supertest';
import nock from 'nock';
import {app} from '../../../../main/app';
import * as launchDarkly from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => {return;}),
      on: jest.fn(async () => {
        return;
      }),
      ttl: jest.fn(() => Promise.resolve({})),
      expireat: jest.fn(() => Promise.resolve({})),
    };
  });
});

describe('Draft Store Health Check - migration flag off', () => {
  beforeEach(() => {
    jest.spyOn(launchDarkly, 'isHmctsAccessMigrationEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  it('should report hmcts-access UP without probing when migration flag is off', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UP');
        expect(res.body['hmcts-access'].status).toBe('UP');
      });
  });
});
