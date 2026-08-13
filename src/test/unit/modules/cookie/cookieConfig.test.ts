const handlers: Record<string, (preferences: {analytics: string; apm: string}) => void> = {};

jest.mock('@hmcts/cookie-manager', () => {
  const on = jest.fn((event: string, callback: (preferences: {analytics: string; apm: string}) => void) => {
    handlers[event] = callback;
  });
  const init = jest.fn();
  return {
    __esModule: true,
    default: {on, init},
  };
});

import cookieManager from '@hmcts/cookie-manager';

describe('cookieConfig', () => {
  const mockDtrum = {
    enable: jest.fn(),
    enableSessionReplay: jest.fn(),
    disable: jest.fn(),
    disableSessionReplay: jest.fn(),
  };

  let initConfig: unknown;

  beforeAll(() => {
    (global as unknown as {window: Window}).window = {
      dataLayer: undefined,
      dtrum: undefined,
    } as unknown as Window;

    require('../../../../main/modules/cookie/cookieConfig');
    initConfig = (cookieManager.init as jest.Mock).mock.calls[0]?.[0];
  });

  beforeEach(() => {
    mockDtrum.enable.mockClear();
    mockDtrum.enableSessionReplay.mockClear();
    mockDtrum.disable.mockClear();
    mockDtrum.disableSessionReplay.mockClear();
    (window as unknown as {dataLayer: unknown}).dataLayer = undefined;
    (window as unknown as {dtrum: unknown}).dtrum = undefined;
  });

  it('should initialise cookie manager with expected config', () => {
    expect(initConfig).toEqual(expect.objectContaining({
      userPreferences: {
        cookieName: 'money-claims-cookie-preferences',
      },
      cookieManifest: expect.arrayContaining([
        expect.objectContaining({
          categoryName: 'essential',
          optional: false,
          cookies: expect.arrayContaining(['citizen-ui-session', 'lang']),
        }),
        expect.objectContaining({
          categoryName: 'analytics',
          cookies: expect.arrayContaining(['_ga', '_gid']),
        }),
        expect.objectContaining({
          categoryName: 'apm',
          cookies: expect.arrayContaining(['dtCookie', 'rxVisitor']),
        }),
      ]),
    }));
  });

  it('should register UserPreferencesLoaded and UserPreferencesSaved handlers', () => {
    expect(handlers.UserPreferencesLoaded).toEqual(expect.any(Function));
    expect(handlers.UserPreferencesSaved).toEqual(expect.any(Function));
  });

  describe('UserPreferencesLoaded', () => {
    it('should push cookie preferences event and skip dynatrace when dtrum is undefined', () => {
      window.dataLayer = [];
      const preferences = {analytics: 'on', apm: 'on'};

      handlers.UserPreferencesLoaded(preferences);

      expect(window.dataLayer).toEqual([
        {event: 'Cookie Preferences', cookiePreferences: preferences},
      ]);
      expect(mockDtrum.enable).not.toHaveBeenCalled();
    });

    it('should enable dynatrace when apm preference is on', () => {
      window.dataLayer = [];
      (window as unknown as {dtrum: typeof mockDtrum}).dtrum = mockDtrum;
      const preferences = {analytics: 'off', apm: 'on'};

      handlers.UserPreferencesLoaded(preferences);

      expect(mockDtrum.enable).toHaveBeenCalled();
      expect(mockDtrum.enableSessionReplay).toHaveBeenCalled();
      expect(mockDtrum.disable).not.toHaveBeenCalled();
    });

    it('should disable dynatrace when apm preference is off', () => {
      window.dataLayer = [];
      (window as unknown as {dtrum: typeof mockDtrum}).dtrum = mockDtrum;
      const preferences = {analytics: 'on', apm: 'off'};

      handlers.UserPreferencesLoaded(preferences);

      expect(mockDtrum.disableSessionReplay).toHaveBeenCalled();
      expect(mockDtrum.disable).toHaveBeenCalled();
      expect(mockDtrum.enable).not.toHaveBeenCalled();
    });

    it('should not throw when dataLayer is missing', () => {
      delete (window as unknown as {dataLayer?: unknown[]}).dataLayer;
      (window as unknown as {dtrum: undefined}).dtrum = undefined;
      const preferences = {analytics: 'on', apm: 'off'};

      // Source creates a local array when window.dataLayer is missing, so the
      // push does not assign back onto window — behaviour should still succeed.
      expect(() => handlers.UserPreferencesLoaded(preferences)).not.toThrow();
      expect(window.dataLayer).toBeUndefined();
    });
  });

  describe('UserPreferencesSaved', () => {
    it('should push preferences and update dynatrace', () => {
      window.dataLayer = [];
      (window as unknown as {dtrum: typeof mockDtrum}).dtrum = mockDtrum;
      const preferences = {analytics: 'on', apm: 'on'};

      handlers.UserPreferencesSaved(preferences);

      expect(window.dataLayer).toContainEqual({
        event: 'Cookie Preferences',
        cookiePreferences: preferences,
      });
      expect(mockDtrum.enable).toHaveBeenCalled();
      expect(mockDtrum.enableSessionReplay).toHaveBeenCalled();
    });
  });
});
