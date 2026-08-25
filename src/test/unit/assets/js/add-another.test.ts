/**
 * Uses manual JSDOM instead of `@jest-environment jsdom` to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 *
 * App Add another: without `.cui-add-another__items` it must no-op; with it, Add clones.
 */
const {JSDOM} = require('jsdom');

describe('add-another', () => {
  function installDom(html: string) {
    const dom = new JSDOM(html, {url: 'http://localhost/'});
    const {window} = dom;
    const globalAny = global as unknown as Record<string, unknown>;
    globalAny.window = window;
    globalAny.document = window.document;
    for (const name of [
      'HTMLElement',
      'HTMLButtonElement',
      'HTMLInputElement',
      'HTMLSelectElement',
      'HTMLTextAreaElement',
    ]) {
      globalAny[name] = (window as unknown as Record<string, unknown>)[name];
    }
    return window;
  }

  it('does not clone items when the items wrapper is missing', () => {
    const window = installDom(`<!DOCTYPE html><html><body>
      <div data-module="cui-add-another">
        <fieldset class="cui-add-another__item">
          <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[0][name]" id="row[0][name]">
        </fieldset>
        <button type="button" class="cui-add-another__add-button">Add</button>
      </div>
    </body></html>`);

    jest.resetModules();
    const {initAddAnother} = require('../../../../main/assets/js/add-another.js');
    initAddAnother(window.document);

    const addButton = window.document.querySelector('.cui-add-another__add-button');
    addButton?.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));

    expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
  });

  it('clones a new item when the items wrapper is present', () => {
    const window = installDom(`<!DOCTYPE html><html><body>
      <div data-module="cui-add-another">
        <div class="cui-add-another__items">
          <fieldset class="cui-add-another__item">
            <legend>Item</legend>
            <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[0][name]" id="row[0][name]" value="kept">
          </fieldset>
        </div>
        <button type="button" class="cui-add-another__add-button">Add</button>
      </div>
    </body></html>`);

    jest.resetModules();
    const {initAddAnother} = require('../../../../main/assets/js/add-another.js');
    initAddAnother(window.document);

    const addButton = window.document.querySelector('.cui-add-another__add-button');
    addButton?.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));

    const items = window.document.querySelectorAll('.cui-add-another__item');
    expect(items.length).toBeGreaterThan(1);
    const clonedInput = items[1].querySelector('input') as HTMLInputElement;
    expect(clonedInput.name).toBe('row[1][name]');
    expect(clonedInput.id).toBe('row[1][name]');
    expect(clonedInput.value).toBe('');
  });

  it('starts append-row clone for .append-row / .row-container markup', () => {
    const window = installDom(`<!DOCTYPE html><html><body>
      <div class="rows">
        <div class="row-container">
          <div class="fields">
            <input id="items[0][name]" name="items[0][name]" value="Alice" />
          </div>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    </body></html>`);

    jest.resetModules();
    const {initAddAnother} = require('../../../../main/assets/js/add-another.js');
    initAddAnother(window.document);

    window.document.querySelector('.append-row')
      ?.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));

    expect(window.document.getElementsByClassName('row-container')).toHaveLength(2);
  });
});
