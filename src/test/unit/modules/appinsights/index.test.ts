import config from 'config';

const mockStart = jest.fn();
const mockSetSendLiveMetrics = jest.fn(() => ({start: mockStart}));
const mockTrackTrace = jest.fn();
const mockClient = {
  context: {tags: {} as Record<string, string>, keys: {cloudRole: 'ai.cloud.role'}},
  config: {samplingPercentage: undefined as number | undefined},
  trackTrace: mockTrackTrace,
};

const mockSetup = jest.fn(() => ({setSendLiveMetrics: mockSetSendLiveMetrics, start: mockStart}));

jest.mock('applicationinsights', () => ({
  setup: (...args: unknown[]) => mockSetup(...args),
  start: mockStart,
  defaultClient: mockClient,
  get setSendLiveMetrics() {
    return mockSetSendLiveMetrics;
  },
}));

jest.mock('config');

import {AppInsights, toConnectionString} from 'modules/appinsights';

const mockConfigGet = config.get as jest.Mock;

describe('AppInsights module', () => {
  const ORIGINAL_ENV = process.env.LAUNCH_DARKLY_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.config.samplingPercentage = undefined;
    mockClient.context.tags = {};
    mockConfigGet.mockReturnValue('test-instrumentation-key');
    mockSetSendLiveMetrics.mockImplementation(() => ({start: mockStart}));
    mockSetup.mockImplementation(() => ({setSendLiveMetrics: mockSetSendLiveMetrics, start: mockStart}));
  });

  afterAll(() => {
    process.env.LAUNCH_DARKLY_ENV = ORIGINAL_ENV;
  });

  describe('toConnectionString', () => {
    it('wraps a bare instrumentation key', () => {
      expect(toConnectionString('abc-123')).toBe('InstrumentationKey=abc-123');
    });

    it('passes through an existing connection string', () => {
      const cs = 'InstrumentationKey=abc;IngestionEndpoint=https://example.in.applicationinsights.azure.com/';
      expect(toConnectionString(cs)).toBe(cs);
    });
  });

  describe('enable', () => {
    it('configures sampling before start in non-prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockSetup).toHaveBeenCalledWith('InstrumentationKey=test-instrumentation-key');
      expect(mockSetSendLiveMetrics).toHaveBeenCalledWith(true);
      expect(mockClient.config.samplingPercentage).toBe(100);
      expect(mockClient.context.tags['ai.cloud.role']).toBe('civil-citizen-ui');
      expect(mockStart).toHaveBeenCalled();
      expect(mockTrackTrace).toHaveBeenCalled();
      // sampling must be applied before start (SDK 3.x requirement)
      expect(mockSetSendLiveMetrics.mock.invocationCallOrder[0])
        .toBeLessThan(mockStart.mock.invocationCallOrder[0]);
    });

    it('leaves sampling untouched in prod', () => {
      process.env.LAUNCH_DARKLY_ENV = 'prod';
      new AppInsights().enable();
      expect(mockClient.config.samplingPercentage).toBeUndefined();
      expect(mockStart).toHaveBeenCalled();
    });

    it('logs an error and does not start when no instrumentation key is set', () => {
      mockConfigGet.mockReturnValue(undefined);
      process.env.LAUNCH_DARKLY_ENV = 'perftest';
      new AppInsights().enable();
      expect(mockSetup).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });
  });
});
