/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('language-toggle', () => {
  const scriptPath = '../../../../main/assets/js/language-toggle.js';
  let dom: InstanceType<typeof JSDOM>;

  function createDom(url: string) {
    dom = new JSDOM('<!DOCTYPE html><html><body><a class="language" href="#">Lang</a></body></html>', {
      url,
    });
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  }

  beforeEach(() => {
    jest.resetModules();
  });

  it('sets Welsh toggle link when lang cookie is en', () => {
    createDom('http://localhost/page');
    document.cookie = 'lang=en';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const link = document.querySelector('.language') as HTMLAnchorElement;
    expect(document.documentElement.lang).toBe('en');
    expect(link.textContent).toBe('Cymraeg');
    expect(link.href).toContain('lang=cy');
  });

  it('sets English toggle link when lang cookie is cy', () => {
    createDom('http://localhost/page?foo=1');
    document.cookie = 'lang=cy';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const link = document.querySelector('.language') as HTMLAnchorElement;
    expect(document.documentElement.lang).toBe('cy');
    expect(link.textContent).toBe('English');
    expect(link.getAttribute('href')).toBe('?foo=1&&lang=en');
  });

  it('replaces existing lang query param', () => {
    createDom('http://localhost/page?lang=en');
    document.cookie = 'lang=en';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const link = document.querySelector('.language') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('?lang=cy');
  });
});
