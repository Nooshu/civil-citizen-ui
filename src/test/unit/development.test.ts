describe('setupDev', () => {
  const webpackDev = jest.fn(() => 'webpack-dev-middleware');
  const webpack = jest.fn(() => 'compiler');

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.doMock('webpack-dev-middleware', () => webpackDev);
    jest.doMock('webpack', () => webpack);
  });

  afterEach(() => {
    jest.dontMock('webpack-dev-middleware');
    jest.dontMock('webpack');
  });

  it('does nothing when developmentMode is false', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {setupDev} = require('../../main/development');
    const app = {use: jest.fn()};

    setupDev(app, false);

    expect(app.use).not.toHaveBeenCalled();
    expect(webpack).not.toHaveBeenCalled();
  });

  it('registers webpack-dev-middleware when developmentMode is true', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {setupDev} = require('../../main/development');
    const app = {use: jest.fn()};

    setupDev(app, true);

    expect(webpack).toHaveBeenCalled();
    expect(webpackDev).toHaveBeenCalledWith('compiler', {publicPath: '/'});
    expect(app.use).toHaveBeenCalledWith('webpack-dev-middleware');
  });
});
