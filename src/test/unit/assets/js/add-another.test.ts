/**
 * Uses manual JSDOM instead of `@jest-environment jsdom` to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 *
 * App Add another after MoJ removal: clone and remove when `.cui-add-another__items`
 * is present; no-op on mediation uploads (server POST, no items wrapper).
 */
const {JSDOM} = require('jsdom');

describe('add-another', () => {
  const scriptPath = '../../../../main/assets/js/add-another.js';

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

  function loadInit(window: Window, scope?: Document | Element) {
    jest.resetModules();
    const {initAddAnother} = require(scriptPath);
    if (scope) {
      initAddAnother(scope);
    } else {
      initAddAnother();
    }
    return window;
  }

  function click(window: Window, el: Element | null) {
    const event = new window.MouseEvent('click', {bubbles: true, cancelable: true});
    return el ? el.dispatchEvent(event) : true;
  }

  const cloneMarkup = `<!DOCTYPE html><html><body>
      <form id="claim-form">
        <div data-module="cui-add-another">
          <div class="cui-add-another__items">
            <fieldset class="cui-add-another__item">
              <legend>Item</legend>
              <div class="govuk-form-group govuk-form-group--error">
                <p class="govuk-error-message">Enter a type</p>
                <select data-name="evidenceItem[%index%][type]" data-id="evidenceItem[%index%][type]"
                  name="evidenceItem[0][type]" id="evidenceItem[0][type]"
                  class="govuk-select govuk-select--error">
                  <option value="">Choose</option>
                  <option value="PHOTO" selected>Photo</option>
                </select>
              </div>
              <textarea data-name="evidenceItem[%index%][description]" data-id="evidenceItem[%index%][description]"
                name="evidenceItem[0][description]" id="evidenceItem[0][description]"
                class="govuk-textarea govuk-textarea--error">kept</textarea>
              <input type="checkbox" data-name="row[%index%][ok]" data-id="row[%index%][ok]"
                name="row[0][ok]" id="row[0][ok]" checked>
              <input type="radio" data-name="row[%index%][kind]" data-id="row[%index%][kind]"
                name="row[0][kind]" id="row[0][kind]" value="a" checked>
              <input type="hidden" name="_csrf" value="token">
              <input type="submit" value="Upload">
              <button type="button" class="cui-add-another__remove-button">Remove</button>
              <div class="govuk-error-summary">Error summary</div>
              <span data-name="hint[%index%]" data-id="hint-%index%" id="hint-0"></span>
            </fieldset>
          </div>
          <div class="cui-add-another__actions">
            <button type="submit" class="govuk-button--secondary cui-add-another__add-button">
              <span>Add another</span>
            </button>
          </div>
        </div>
      </form>
    </body></html>`;

  describe('mediation no-op', () => {
    it('does not clone when the items wrapper is missing (mediation server POST)', () => {
      const window = installDom(`<!DOCTYPE html><html><body>
        <form method="post">
          <div data-module="cui-add-another">
            <div class="cui-add-another__item">
              <input name="yourStatement[0][date]" value="2020-01-01">
            </div>
            <div class="govuk-button-group">
              <button type="submit" name="action" value="add_another-yourStatement"
                id="add-another-yourStatement">Add</button>
            </div>
          </div>
        </form>
      </body></html>`);

      loadInit(window, window.document);

      const submit = window.document.getElementById('add-another-yourStatement');
      expect(click(window, submit)).toBe(true);
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
      expect((submit as HTMLButtonElement).type).toBe('submit');
    });

    it('does not bind clone when an add-button exists but .cui-add-another__items does not', () => {
      const window = installDom(`<!DOCTYPE html><html><body>
        <div data-module="cui-add-another">
          <fieldset class="cui-add-another__item">
            <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[0][name]" id="row[0][name]">
          </fieldset>
          <button type="button" class="cui-add-another__add-button">Add</button>
        </div>
      </body></html>`);

      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__add-button'));

      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });
  });

  describe('clone', () => {
    it('clones a new item, reindexes placeholders, and clears field values', () => {
      const window = installDom(cloneMarkup);
      loadInit(window, window.document);
      const addButton = window.document.querySelector('.cui-add-another__add-button');

      expect((addButton as HTMLButtonElement).type).toBe('button');
      expect(click(window, addButton)).toBe(false);

      const items = window.document.querySelectorAll('.cui-add-another__item');
      expect(items).toHaveLength(2);

      const originalSelect = items[0].querySelector('select') as HTMLSelectElement;
      expect(originalSelect.value).toBe('PHOTO');
      expect(originalSelect.name).toBe('evidenceItem[0][type]');

      const clonedSelect = items[1].querySelector('select') as HTMLSelectElement;
      expect(clonedSelect.name).toBe('evidenceItem[1][type]');
      expect(clonedSelect.id).toBe('evidenceItem[1][type]');
      expect(clonedSelect.value).toBe('');
      expect(clonedSelect.classList.contains('govuk-select--error')).toBe(false);

      const clonedTextarea = items[1].querySelector('textarea') as HTMLTextAreaElement;
      expect(clonedTextarea.name).toBe('evidenceItem[1][description]');
      expect(clonedTextarea.value).toBe('');
      expect(clonedTextarea.classList.contains('govuk-textarea--error')).toBe(false);

      const clonedCheckbox = items[1].querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(clonedCheckbox.checked).toBe(false);
      expect(clonedCheckbox.name).toBe('row[1][ok]');

      const clonedRadio = items[1].querySelector('input[type="radio"]') as HTMLInputElement;
      expect(clonedRadio.checked).toBe(false);

      const clonedHidden = items[1].querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(clonedHidden.value).toBe('token');
      const clonedSubmit = items[1].querySelector('input[type="submit"]') as HTMLInputElement;
      expect(clonedSubmit.value).toBe('Upload');

      expect(items[1].querySelector('.govuk-error-message')).toBeNull();
      expect(items[1].querySelector('.govuk-error-summary')).toBeNull();
      expect(items[1].querySelector('.govuk-form-group--error')).toBeNull();
      expect(items[1].querySelector('[data-id="hint-%index%"]')?.id).toBe('hint-1');
    });

    it('clones when the click target is nested inside the add button', () => {
      const window = installDom(cloneMarkup);
      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__add-button span'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(2);
    });

    it('does not clone when the items wrapper has no .cui-add-another__item', () => {
      const window = installDom(`<!DOCTYPE html><html><body>
        <div data-module="cui-add-another">
          <div class="cui-add-another__items"></div>
          <button type="button" class="cui-add-another__add-button">Add</button>
        </div>
      </body></html>`);

      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__add-button'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(0);
    });

    it('ignores clicks that are not add or remove controls', () => {
      const window = installDom(cloneMarkup);
      loadInit(window, window.document);
      click(window, window.document.querySelector('legend'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });

    it('ignores a text-node click so non-element targets do not throw', () => {
      const window = installDom(cloneMarkup);
      loadInit(window, window.document);
      const addButton = window.document.querySelector('.cui-add-another__add-button') as HTMLButtonElement;
      const text = window.document.createTextNode('inner');
      addButton.appendChild(text);
      text.dispatchEvent(new window.MouseEvent('click', {bubbles: true, cancelable: true}));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });

    it('does not clone from an add button that sits outside the module root', () => {
      const window = installDom(`<!DOCTYPE html><html><body>
        <button type="button" class="cui-add-another__add-button" id="outer-add">Outer</button>
        <div data-module="cui-add-another">
          <div class="cui-add-another__items">
            <fieldset class="cui-add-another__item">
              <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[0][name]" id="row[0][name]">
            </fieldset>
          </div>
        </div>
      </body></html>`);

      loadInit(window, window.document);
      click(window, window.document.getElementById('outer-add'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });

    it('binds using the default document scope', () => {
      const window = installDom(cloneMarkup);
      loadInit(window);
      click(window, window.document.querySelector('.cui-add-another__add-button'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(2);
    });
  });

  describe('remove', () => {
    function twoItemMarkup() {
      return `<!DOCTYPE html><html><body>
        <div data-module="cui-add-another">
          <div class="cui-add-another__items">
            <fieldset class="cui-add-another__item">
              <input data-name="row[%index%][name]" data-id="row[%index%][name]"
                name="row[0][name]" id="row[0][name]" value="first">
              <button type="submit" class="cui-add-another__remove-button"><span>Remove</span></button>
            </fieldset>
            <fieldset class="cui-add-another__item">
              <input data-name="row[%index%][name]" data-id="row[%index%][name]"
                name="row[1][name]" id="row[1][name]" value="second">
              <button type="submit" class="cui-add-another__remove-button">Remove</button>
            </fieldset>
          </div>
          <button type="button" class="cui-add-another__add-button">Add</button>
        </div>
      </body></html>`;
    }

    it('removes an extra item and reindexes the remaining row', () => {
      const window = installDom(twoItemMarkup());
      loadInit(window, window.document);
      const removeButtons = window.document.querySelectorAll('.cui-add-another__remove-button');
      expect((removeButtons[0] as HTMLButtonElement).type).toBe('button');
      expect(click(window, removeButtons[0])).toBe(false);

      const items = window.document.querySelectorAll('.cui-add-another__item');
      expect(items).toHaveLength(1);
      const remaining = items[0].querySelector('input') as HTMLInputElement;
      expect(remaining.value).toBe('second');
      expect(remaining.name).toBe('row[0][name]');
      expect(remaining.id).toBe('row[0][name]');
    });

    it('removes when the click target is nested inside the remove button', () => {
      const window = installDom(twoItemMarkup());
      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__remove-button span'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });

    it('does not remove the last remaining item', () => {
      const window = installDom(cloneMarkup);
      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__remove-button'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(1);
    });

    it('does not remove when the remove control is not inside an item', () => {
      const window = installDom(`<!DOCTYPE html><html><body>
        <div data-module="cui-add-another">
          <div class="cui-add-another__items">
            <fieldset class="cui-add-another__item">
              <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[0][name]" id="row[0][name]">
            </fieldset>
            <fieldset class="cui-add-another__item">
              <input data-name="row[%index%][name]" data-id="row[%index%][name]" name="row[1][name]" id="row[1][name]">
            </fieldset>
          </div>
          <button type="button" class="cui-add-another__remove-button">Remove stray</button>
        </div>
      </body></html>`);

      loadInit(window, window.document);
      click(window, window.document.querySelector('.cui-add-another__remove-button'));
      expect(window.document.querySelectorAll('.cui-add-another__item')).toHaveLength(2);
    });
  });

  describe('append-row handoff', () => {
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

      loadInit(window, window.document);
      click(window, window.document.querySelector('.append-row'));
      expect(window.document.getElementsByClassName('row-container')).toHaveLength(2);
    });
  });
});
