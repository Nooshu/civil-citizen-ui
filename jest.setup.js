const nock = require('nock');

jest.retryTimes(2);

afterAll(() => {
  // Remove interceptors only — do not nock.restore(), which disables HTTP mocking for later
  // files in the same Jest worker and can leave real sockets open.
  nock.cleanAll();
});
