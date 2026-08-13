/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('append-row', () => {
  const scriptPath = '../../../../main/assets/js/append-row.js';
  let dom: InstanceType<typeof JSDOM>;

  function installDom() {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  }

  beforeEach(() => {
    jest.resetModules();
    installDom();
    global.fetch = jest.fn().mockResolvedValue({json: async () => '0'});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function setupBasicRow() {
    // Fields must be nested under a child of .row-container (clone uses child.querySelectorAll).
    // remove-row's parent must be .row-container so removal deletes the whole row.
    document.body.innerHTML = `
      <input type="hidden" name="_csrf" value="token" />
      <span class="total-monthly-income-expense"></span>
      <div class="rows">
        <div class="row-container">
          <div class="fields">
            <input id="items[0][name]" name="items[0][name]" value="Alice" />
            <label for="items[0][name]">Name 1</label>
            <span class="govuk-error-message">Required</span>
            <div class="govuk-form-group govuk-form-group--error">
              <input class="govuk-input--error" id="items[0][amount]" name="items[0][amount]" value="10" />
            </div>
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row govuk-!-display-none">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  }

  it('clones a row, clears values, increments indexes, and strips errors', () => {
    setupBasicRow();

    document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const rows = document.getElementsByClassName('row-container');
    expect(rows).toHaveLength(2);

    const newInput = rows[1].querySelector('input[name^="items"]') as HTMLInputElement;
    expect(newInput.value).toBe('');
    expect(newInput.name).toBe('items[1][name]');
    expect(newInput.id).toBe('items[1][name]');
    expect(rows[1].querySelector('.govuk-error-message')).toBeNull();
    expect(rows[1].querySelector('.govuk-form-group--error')).toBeNull();
    expect(rows[1].querySelector('.govuk-input--error')).toBeNull();
  });

  it('shows remove buttons on additional rows and hides them when only one remains', () => {
    setupBasicRow();

    document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    const removeButtons = document.querySelectorAll('.remove-row');
    expect(removeButtons[1].classList.contains('govuk-!-display-none')).toBe(false);

    removeButtons[1].dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    expect(document.getElementsByClassName('row-container')).toHaveLength(1);
    expect(document.querySelector('.remove-row')!.classList.contains('govuk-!-display-none')).toBe(true);
  });

  it('toggles checkbox conditionals on newly added checkboxes', () => {
    document.body.innerHTML = `
      <input type="hidden" name="_csrf" value="token" />
      <span class="total-monthly-income-expense"></span>
      <div class="rows">
        <div class="row-container">
          <div class="fields">
            <input type="checkbox" class="govuk-checkboxes__input" id="declared-0-income" name="declared[0][income]" aria-expanded="false" />
            <div id="conditional-declared-0-income" class="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden"></div>
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row govuk-!-display-none">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const newCheckbox = document.getElementById('declared-1-income') as HTMLInputElement;
    expect(newCheckbox).not.toBeNull();
    newCheckbox.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const conditional = document.getElementById('conditional-declared-1-income')!;
    expect(conditional.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(false);
    expect(newCheckbox.ariaExpanded).toBe('true');
  });

  it('updates legends and aria attributes when cloning rows', () => {
    document.body.innerHTML = `
      <div class="rows">
        <div class="row-container">
          <div class="fields">
            <legend class="table-row-legend-new">Item 1</legend>
            <input id="items[0][name]" name="items[0][name]" value="Alice"
              aria-describedby="hint-0" aria-label="Name [0]" aria-controls="panel-0" />
            <label for="items[0][name]">Name 1</label>
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row govuk-!-display-none">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const rows = document.getElementsByClassName('row-container');
    expect(rows).toHaveLength(2);
    const legend = rows[1].querySelector('legend')!;
    expect(legend.textContent).toContain('2');
    expect(legend.getAttribute('id')).toBe('table-row-legend-2');
  });

  it('toggles unavailable-date radio conditionals on newly added radios', () => {
    document.body.innerHTML = `
      <div class="rows">
        <div class="row-container">
          <div class="fields">
            <input type="radio" class="govuk-radios__input" id="items-0-single" name="items[0][type]" value="single" checked />
            <input type="radio" class="govuk-radios__input" id="items-0-longer" name="items[0][type]" value="longer" />
            <div id="conditional-items-0-single-date" class="govuk-radios__conditional"></div>
            <div id="conditional-items-0-longer-period" class="govuk-radios__conditional govuk-radios__conditional--hidden"></div>
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row govuk-!-display-none">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const longerRadio = document.getElementById('items-1-longer') as HTMLInputElement;
    expect(longerRadio).not.toBeNull();
    longerRadio.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const longerConditional = document.getElementById('conditional-items-1-longer-period')!;
    const singleConditional = document.getElementById('conditional-items-1-single-date')!;
    expect(longerConditional.classList.contains('govuk-radios__conditional--hidden')).toBe(false);
    expect(singleConditional.classList.contains('govuk-radios__conditional--hidden')).toBe(true);
  });

  it('removes a civil-amountRow without throwing', () => {
    document.body.innerHTML = `
      <input type="hidden" name="_csrf" value="token" />
      <span class="total-monthly-income-expense"></span>
      <div class="rows">
        <div class="row-container civil-amountRow">
          <div class="fields">
            <input id="items[0][amount]" name="items[0][amount]" value="10" />
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row">Remove</button>
        </div>
        <div class="row-container civil-amountRow">
          <div class="fields">
            <input id="items[1][amount]" name="items[1][amount]" value="20" />
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    const removeButtons = document.querySelectorAll('.remove-row');
    expect(() => {
      removeButtons[1].dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    }).not.toThrow();
    expect(document.getElementsByClassName('row-container')).toHaveLength(1);
  });

  it('clones civil-amount-breakdown-row and civil-amountRow rows', () => {
    document.body.innerHTML = `
      <input type="hidden" name="_csrf" value="token" />
      <span class="total-monthly-income-expense"></span>
      <div class="rows">
        <div class="row-container civil-amountRow civil-amount-breakdown-row">
          <div class="fields">
            <input id="items[0][amount]" name="items[0][amount]" value="10" />
          </div>
          <button type="button" class="govuk-button govuk-button--secondary remove-row govuk-!-display-none">Remove</button>
        </div>
      </div>
      <button type="button" class="append-row">Add another</button>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    expect(() => {
      document.querySelector('.append-row')!.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    }).not.toThrow();
    expect(document.getElementsByClassName('row-container')).toHaveLength(2);
  });
});
