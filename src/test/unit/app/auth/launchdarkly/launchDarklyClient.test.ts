const mockFlagBuilder = {
  booleanFlag: jest.fn().mockReturnThis(),
  variationForAll: jest.fn().mockReturnValue('flag-config'),
};

const mockTestDataInstance = {
  update: jest.fn().mockResolvedValue(undefined),
  flag: jest.fn(() => mockFlagBuilder),
  getFactory: jest.fn().mockReturnValue({factory: true}),
};

jest.mock('@launchdarkly/node-server-sdk/integrations', () => ({
  TestData: jest.fn(() => mockTestDataInstance),
}));

type LaunchDarklyClientModule = typeof import('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
type LdInit = typeof import('@launchdarkly/node-server-sdk').init;

describe('launchDarklyClient', () => {
  const originalEnv = {...process.env};
  let client: LaunchDarklyClientModule;
  let init: jest.MockedFunction<LdInit>;
  let ldClient: {variation: jest.Mock; waitForInitialization: jest.Mock};

  const loadModule = async () => {
    jest.resetModules();
    jest.doMock('@launchdarkly/node-server-sdk/integrations', () => ({
      TestData: jest.fn(() => mockTestDataInstance),
    }));

    const sdk = await import('@launchdarkly/node-server-sdk');
    init = sdk.init as jest.MockedFunction<LdInit>;
    init.mockClear();

    // Shared mock client from jest.setup.redis-mock.js
    ldClient = (init as unknown as jest.Mock)();
    init.mockClear(); // ignore the probe call used only to obtain the shared client
    ldClient.variation.mockReset();
    ldClient.variation.mockResolvedValue(false);

    client = await import('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
    return client;
  };

  beforeEach(async () => {
    process.env = {...originalEnv};
    process.env.LAUNCH_DARKLY_SDK = 'test-sdk-key';
    delete process.env.NODE_ENV;

    mockTestDataInstance.update.mockClear();
    mockTestDataInstance.flag.mockClear();
    mockFlagBuilder.booleanFlag.mockClear();
    mockFlagBuilder.variationForAll.mockClear();

    await loadModule();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('simple boolean flag helpers', () => {
    it.each([
      ['isServiceShuttered', 'shutter-cui-service'],
      ['isPcqShutterOn', 'shutter-pcq'],
      ['isGaForLipsEnabled', 'GaForLips'],
      ['isHmctsAccessMigrationEnabled', 'hmcts-access-migration'],
      ['isCaseWorkerEventsEnabled', 'cui-case-events-enabled'],
      ['isWelshEnabledForMainCase', 'enableWelshForMainCase'],
      ['isCuiGaNroEnabled', 'cui-ga-nro'],
      ['isJudgmentBufferEnabled', 'judgment-buffer'],
    ] as const)('%s should return variation for %s', async (methodName, flagKey) => {
      ldClient.variation.mockResolvedValue(true);

      const result = await (client[methodName] as () => Promise<boolean>)();

      expect(result).toBe(true);
      expect(ldClient.variation).toHaveBeenCalledWith(
        flagKey,
        expect.objectContaining({name: 'civil-service', key: 'civil-service'}),
        false,
      );
    });
  });

  describe('date-based flag helpers', () => {
    const sampleDate = new Date('2024-06-15T12:00:00.000Z');

    it.each([
      ['isDashboardEnabledForCase', 'is-dashboard-enabled-for-case'],
      ['isCarmEnabledForCase', 'cam-enabled-for-case'],
      ['isMintiEnabledForCase', 'multi-or-intermediate-track'],
      ['isQueryManagementEnabled', 'cui-query-management'],
      ['isDefendantNoCOnlineForCase', 'is-defendant-noc-online-for-case'],
    ] as const)('%s should pass epoch seconds for %s', async (methodName, flagKey) => {
      ldClient.variation.mockResolvedValue(true);

      const result = await (client[methodName] as (date: Date) => Promise<boolean>)(sampleDate);

      expect(result).toBe(true);
      expect(ldClient.variation).toHaveBeenCalledWith(
        flagKey,
        expect.objectContaining({
          custom: expect.objectContaining({
            environment: expect.any(String),
            timestamp: expect.any(Number),
          }),
        }),
        false,
      );
    });
  });

  describe('isGaForLipsEnabledAndLocationWhiteListed', () => {
    it('should return true when both GA lips and EA court flags are true', async () => {
      ldClient.variation
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const result = await client.isGaForLipsEnabledAndLocationWhiteListed('location-1');

      expect(result).toBe(true);
      expect(ldClient.variation).toHaveBeenNthCalledWith(1, 'GaForLips', expect.any(Object), false);
      expect(ldClient.variation).toHaveBeenNthCalledWith(
        2,
        'ea-courts-whitelisted-for-ga-lips',
        expect.objectContaining({
          custom: expect.objectContaining({location: 'location-1'}),
        }),
        false,
      );
    });

    it('should return false when either flag is false', async () => {
      ldClient.variation
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expect(client.isGaForLipsEnabledAndLocationWhiteListed('loc')).resolves.toBe(false);
    });
  });

  describe('getFlagValue without sdk', () => {
    it('should return undefined when sdk is not configured', async () => {
      jest.resetModules();
      delete process.env.LAUNCH_DARKLY_SDK;

      jest.doMock('config', () => ({
        __esModule: true,
        default: {
          get: jest.fn((key: string) => {
            if (key === 'services.launchDarkly.sdk') return '';
            if (key === 'services.launchDarkly.env') return 'default';
            return undefined;
          }),
        },
      }));
      jest.doMock('@launchdarkly/node-server-sdk/integrations', () => ({
        TestData: jest.fn(() => mockTestDataInstance),
      }));

      const mod = await import('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
      await expect(mod.getFlagValue('any-flag')).resolves.toBeUndefined();
    });
  });

  describe('e2eTest initialization and updateE2EKey', () => {
    it('should initialize with TestData when NODE_ENV is e2eTest', async () => {
      process.env.NODE_ENV = 'e2eTest';
      process.env.LAUNCH_DARKLY_SDK = 'e2e-sdk';
      await loadModule();

      await client.isServiceShuttered();

      expect(init).toHaveBeenCalledWith(
        'e2e-sdk',
        expect.objectContaining({updateProcessor: expect.anything()}),
      );
      expect(mockTestDataInstance.update).toHaveBeenCalled();
    });

    it('should update e2e flag variation via updateE2EKey', async () => {
      process.env.NODE_ENV = 'e2eTest';
      process.env.LAUNCH_DARKLY_SDK = 'e2e-sdk';
      await loadModule();

      await client.isServiceShuttered();
      mockTestDataInstance.flag.mockClear();
      mockFlagBuilder.variationForAll.mockClear();

      await client.updateE2EKey('shutter-cui-service', true);

      expect(mockTestDataInstance.flag).toHaveBeenCalledWith('shutter-cui-service');
      expect(mockFlagBuilder.variationForAll).toHaveBeenCalledWith(true);
    });
  });

  describe('user context without launchDarkly env', () => {
    it('should use basic user when launchDarkly env is empty', async () => {
      jest.resetModules();
      process.env.LAUNCH_DARKLY_SDK = 'test-sdk-key';
      delete process.env.NODE_ENV;

      jest.doMock('config', () => ({
        __esModule: true,
        default: {
          get: jest.fn((key: string) => {
            if (key === 'services.launchDarkly.sdk') return 'test-sdk-key';
            if (key === 'services.launchDarkly.env') return '';
            return undefined;
          }),
        },
      }));
      jest.doMock('@launchdarkly/node-server-sdk/integrations', () => ({
        TestData: jest.fn(() => mockTestDataInstance),
      }));

      const sdk = await import('@launchdarkly/node-server-sdk');
      const freshInit = sdk.init as unknown as jest.Mock;
      const envClient = freshInit();
      freshInit.mockClear();
      envClient.variation.mockReset();
      envClient.variation.mockResolvedValue(true);

      const mod = await import('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
      await mod.isServiceShuttered();

      expect(envClient.variation).toHaveBeenCalledWith(
        'shutter-cui-service',
        {name: 'civil-service', key: 'civil-service'},
        false,
      );
    });
  });
});
