/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('conditionally-hide-add-button', () => {
  const scriptPath = '../../../../main/assets/js/conditionally-hide-add-button.js';
  let dom: InstanceType<typeof JSDOM>;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  function itemsHtml(count: number) {
    return Array.from({length: count}, () => '<div class="moj-add-another__item"></div>').join('');
  }

  it('hides the add button once item count exceeds maximumNumberOfRows - 2', () => {
    // maximumNumberOfRows is 10, so hide when count > 8
    document.body.innerHTML = `
      ${itemsHtml(9)}
      <button id="add-another-court-order" class="moj-add-another__add-button">Add</button>
    `;
     
    require(scriptPath);

    const button = document.getElementById('add-another-court-order')!;
    button.dispatchEvent(new dom.window.MouseEvent('click'));

    expect(button.classList.contains('hide')).toBe(true);
  });

  it('does not hide the add button when under the threshold', () => {
    document.body.innerHTML = `
      ${itemsHtml(5)}
      <button id="add-another-court-order" class="moj-add-another__add-button">Add</button>
    `;
     
    require(scriptPath);

    const button = document.getElementById('add-another-court-order')!;
    button.dispatchEvent(new dom.window.MouseEvent('click'));

    expect(button.classList.contains('hide')).toBe(false);
  });

  it('does not throw when the configured button is absent', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => {
       
      require(scriptPath);
    }).not.toThrow();
  });
});
