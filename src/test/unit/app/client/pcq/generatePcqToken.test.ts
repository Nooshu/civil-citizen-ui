import config from 'config';
import {createToken} from 'client/pcq/generatePcqToken';
import {PcqParameters} from 'client/pcq/pcqParameters';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return {
    Logger: {
      getLogger: () => logger,
    },
    mockLogger: logger,
  };
});

const {mockLogger} = jest.requireMock('@hmcts/nodejs-logging') as {
  mockLogger: {error: jest.Mock; info: jest.Mock; warn: jest.Mock};
};

describe('generatePcqToken', () => {
  const params: PcqParameters = {
    pcqId: 'pcq-id',
    serviceId: 'civil-citizen-ui',
    actor: 'respondent',
    partyId: 'party@example.com',
    returnUrl: 'https://example.com/return',
    language: 'en',
  };

  beforeEach(() => {
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create an encrypted hex token when token key is configured', () => {
    const token = createToken(params);

    expect(token).toBeTruthy();
    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('should create deterministic tokens for the same params', () => {
    expect(createToken(params)).toBe(createToken(params));
  });

  it('should create different tokens for different params', () => {
    const otherParams: PcqParameters = {
      ...params,
      partyId: 'other@example.com',
    };

    expect(createToken(params)).not.toBe(createToken(otherParams));
  });

  it('should return empty string and log when token key is missing', () => {
    jest.spyOn(config, 'get').mockReturnValueOnce('' as unknown as string);

    const token = createToken(params);

    expect(token).toBe('');
    expect(mockLogger.error).toHaveBeenCalledWith('PCQ token key is missing.');
  });
});
