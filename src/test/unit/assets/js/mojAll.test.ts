/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 *
 * mojAll.js is a bundled MOJ frontend build; this is a light smoke test.
 */
const {JSDOM} = require('jsdom');

describe('mojAll', () => {
  const scriptPath = '../../../../main/assets/js/mojAll.js';

  it('initialises without throwing and exposes MOJFrontend on window', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    const {window} = dom;
    (global as unknown as {window: Window}).window = window;
    (global as unknown as {document: Document}).document = window.document;
    (global as unknown as {Element: typeof Element}).Element = window.Element;
    (global as unknown as {HTMLElement: typeof HTMLElement}).HTMLElement = window.HTMLElement;
    (global as unknown as {Node: typeof Node}).Node = window.Node;
    (global as unknown as {Document: typeof Document}).Document = window.Document;
    (global as unknown as {MutationObserver: typeof MutationObserver}).MutationObserver = window.MutationObserver;

    jest.resetModules();
     
    const $ = require('jquery');
    (window as unknown as {$: typeof $}).$ = $;
    (global as unknown as {$: typeof $}).$ = $;

    expect(() => {
       
      require(scriptPath);
    }).not.toThrow();

    expect((window as unknown as {MOJFrontend: unknown}).MOJFrontend).toBeDefined();
    expect(typeof (window as unknown as {MOJFrontend: {initAll: unknown}}).MOJFrontend.initAll).toBe('function');
  });
});
