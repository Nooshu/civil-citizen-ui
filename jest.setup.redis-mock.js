/**
 * In-memory Redis stand-in for Jest.
 *
 * Prefer this over `ioredis-mock`: the mock package leaves handles that prevent Jest
 * workers from exiting gracefully after large suites (force-exit warning).
 */
class MemoryRedis {
  constructor() {
    this._data = new Map();
    this._ttls = new Map();
    this._listeners = new Map();
    // Fire connect asynchronously so `on('connect', …)` registrations in constructors work,
    // without creating sockets or long-lived timers.
    queueMicrotask(() => this.emit('connect'));
  }

  on(event, handler) {
    const list = this._listeners.get(event) || [];
    list.push(handler);
    this._listeners.set(event, list);
    return this;
  }

  emit(event, ...args) {
    for (const handler of this._listeners.get(event) || []) {
      handler(...args);
    }
  }

  async get(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  }

  async set(key, value, ...args) {
    // Support ioredis-style: set(key, value), set(key, value, 'EX', seconds), set(key, value, 'KEEPTTL')
    this._data.set(key, value);
    if (args[0] === 'EX' && typeof args[1] === 'number') {
      this._ttls.set(key, args[1]);
    }
    return 'OK';
  }

  async del(...keys) {
    let removed = 0;
    for (const key of keys) {
      if (this._data.delete(key)) {
        removed += 1;
      }
      this._ttls.delete(key);
    }
    return removed;
  }

  async expire(key, seconds) {
    if (!this._data.has(key)) {
      return 0;
    }
    this._ttls.set(key, seconds);
    return 1;
  }

  async ttl(key) {
    if (!this._data.has(key)) {
      return -2;
    }
    return this._ttls.has(key) ? this._ttls.get(key) : -1;
  }

  async keys(pattern) {
    const all = [...this._data.keys()];
    if (!pattern || pattern === '*') {
      return all;
    }
    // Minimal glob: '*' wildcards only (enough for draft-store `*${userId}` lookups).
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const re = new RegExp(`^${escaped}$`);
    return all.filter((key) => re.test(key));
  }

  async ping() {
    return 'PONG';
  }

  async call(command, ...args) {
    const cmd = String(command).toUpperCase();
    switch (cmd) {
      case 'GET':
        return this.get(args[0]);
      case 'SET':
        return this.set(args[0], args[1], ...args.slice(2));
      case 'DEL':
        return this.del(...args);
      case 'EXPIRE':
        return this.expire(args[0], Number(args[1]));
      case 'TTL':
        return this.ttl(args[0]);
      case 'PING':
        return this.ping();
      case 'INCR': {
        const next = Number(await this.get(args[0]) || 0) + 1;
        await this.set(args[0], String(next));
        return next;
      }
      case 'PTTL': {
        const seconds = await this.ttl(args[0]);
        if (seconds < 0) {
          return seconds;
        }
        return seconds * 1000;
      }
      default:
        return null;
    }
  }

  disconnect() {
    this._data.clear();
    this._ttls.clear();
    this._listeners.clear();
  }

  quit() {
    this.disconnect();
    return Promise.resolve('OK');
  }

  duplicate() {
    return new MemoryRedis();
  }

  status = 'ready';
}

const ldClientMock = {
  track: jest.fn(),
  identify: jest.fn(),
  allFlags: jest.fn(),
  close: jest.fn(),
  flush: jest.fn(),
  getContext: jest.fn(),
  off: jest.fn(),
  on: jest.fn(),
  setStreaming: jest.fn(),
  variation: jest.fn(),
  variationDetail: jest.fn(),
  waitForInitialization: jest.fn(),
  waitUntilGoalsReady: jest.fn(),
  waitUntilReady: jest.fn(),
};
ldClientMock.waitForInitialization.mockResolvedValue(ldClientMock);

jest.mock('ioredis', () => {
  return MemoryRedis;
});
jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: jest.fn().mockReturnValue(ldClientMock),
}));
