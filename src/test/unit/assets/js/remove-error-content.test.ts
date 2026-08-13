/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('remove-error-content', () => {
  const scriptPath = '../../../../main/assets/js/remove-error-content.js';
  let dom: InstanceType<typeof JSDOM>;

  function installDom() {
    dom = new JSDOM(
      '<!DOCTYPE html><html><body><button class="moj-add-another__add-button">Add</button></body></html>',
      {url: 'http://localhost/'},
    );
    const {window} = dom;
    (global as unknown as {window: Window}).window = window;
    (global as unknown as {document: Document}).document = window.document;
    (global as unknown as {MutationObserver: typeof MutationObserver}).MutationObserver = window.MutationObserver;
    (global as unknown as {Element: typeof Element}).Element = window.Element;
    (global as unknown as {HTMLElement: typeof HTMLElement}).HTMLElement = window.HTMLElement;
    (global as unknown as {Node: typeof Node}).Node = window.Node;
  }

  beforeEach(() => {
    jest.resetModules();
    installDom();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
  });

  it('hides error UI and removes loading/document nodes from added items', async () => {
    const container = document.createElement('div');
    container.className = 'moj-add-another__item';
    container.innerHTML = `
      <div id="file-loadingContainer">Loading</div>
      <div id="docs[0][documentName]">file.pdf</div>
      <div class="govuk-error-summary">Summary</div>
      <span class="govuk-error-message">Error</span>
      <div class="govuk-form-group govuk-form-group--error">
        <input class="govuk-input govuk-input--error" />
      </div>
    `;

    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById('file-loadingContainer')).toBeNull();
    expect(document.getElementById('docs[0][documentName]')).toBeNull();
    expect(container.querySelector('.govuk-error-summary')!.classList.contains('hide')).toBe(true);
    expect(container.querySelector('.govuk-error-message')!.classList.contains('hide')).toBe(true);
    expect(container.querySelector('input')!.classList.contains('govuk-input--error')).toBe(false);
    expect(container.querySelector('.govuk-form-group')!.classList.contains('govuk-form-group--error')).toBe(false);
  });
});
