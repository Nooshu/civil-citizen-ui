/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('select-toggle', () => {
  const scriptPath = '../../../../main/assets/js/select-toggle.js';
  let dom: InstanceType<typeof JSDOM>;
  let $: typeof import('jquery');

  function installDom() {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  }

  beforeEach(() => {
    jest.resetModules();
    installDom();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    $ = require('jquery');
    (dom.window as unknown as {$: typeof $}).$ = $;
    (global as unknown as {$: typeof $}).$ = $;
  });

  function load() {
    // Nest the select under an intermediate wrapper so parentsUntil('.select-toggle') can find .panel
    document.body.innerHTML = `
      <div class="select-toggle">
        <div class="govuk-form-group">
          <select class="govuk-select">
            <option value="">Choose</option>
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </select>
          <div class="panel govuk-visually-hidden">
            <span class="govuk-visually-hidden">Detail A</span>
            <span class="govuk-visually-hidden">Detail B</span>
            <textarea></textarea>
          </div>
        </div>
        <button type="button" class="moj-add-another__add-button">Add</button>
      </div>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
  }

  it('shows the panel and matching detail when a value is selected', () => {
    load();
    const select = document.querySelector('.govuk-select') as HTMLSelectElement;
    select.selectedIndex = 1;
    $(select).trigger('change');

    const panel = document.querySelector('.panel')!;
    expect(panel.classList.contains('govuk-visually-hidden')).toBe(false);
    expect(panel.querySelectorAll('span')[0].classList.contains('govuk-visually-hidden')).toBe(false);
    expect(panel.querySelectorAll('span')[1].classList.contains('govuk-visually-hidden')).toBe(true);
  });

  it('hides the panel and clears textarea when empty option is selected', () => {
    load();
    const select = document.querySelector('.govuk-select') as HTMLSelectElement;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;

    select.selectedIndex = 1;
    $(select).trigger('change');
    textarea.value = 'notes';

    select.selectedIndex = 0;
    $(select).trigger('change');

    expect(document.querySelector('.panel')!.classList.contains('govuk-visually-hidden')).toBe(true);
    expect(textarea.value).toBe('');
  });
});
