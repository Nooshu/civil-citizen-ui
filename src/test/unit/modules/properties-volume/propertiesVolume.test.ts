import {Application} from 'express';
import {PropertiesVolume} from 'modules/properties-volume';

const addTo = jest.fn();
const has = jest.fn();
const get = jest.fn();
const set = jest.fn();

jest.mock('@hmcts/properties-volume', () => ({
  addTo: (...args: unknown[]) => addTo(...args),
}));

jest.mock('config', () => ({
  __esModule: true,
  default: {
    has: (path: string) => has(path),
    get: (path: string) => get(path),
  },
}));

jest.mock('lodash', () => ({
  get: (...args: unknown[]) => get(...args),
  set: (...args: unknown[]) => set(...args),
}));

describe('PropertiesVolume', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip secret wiring in development', () => {
    const server = {locals: {ENV: 'development'}} as unknown as Application;
    new PropertiesVolume().enableFor(server);
    expect(addTo).not.toHaveBeenCalled();
    expect(has).not.toHaveBeenCalled();
  });

  it('should wire secrets when present outside development', () => {
    has.mockReturnValue(true);
    get.mockImplementation((path: string) => `value-for-${path}`);
    const server = {locals: {ENV: 'production'}} as unknown as Application;

    new PropertiesVolume().enableFor(server);

    expect(addTo).toHaveBeenCalled();
    expect(has).toHaveBeenCalled();
    expect(set).toHaveBeenCalled();
  });

  it('should skip secrets that are not present in config', () => {
    has.mockReturnValue(false);
    const server = {locals: {ENV: 'aat'}} as unknown as Application;

    new PropertiesVolume().enableFor(server);

    expect(addTo).toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });
});
