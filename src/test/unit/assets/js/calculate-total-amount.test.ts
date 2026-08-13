/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28.
 */
const {JSDOM} = require('jsdom');

describe('calculate-total-amount', () => {
  const scriptPath = '../../../../main/assets/js/calculate-total-amount.js';
  let dom: InstanceType<typeof JSDOM>;
  let addTotalClaimAmountCalculationEventListener: () => void;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    dom.window.document.body.innerHTML = '';
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function loadModule(amounts: string[]) {
    const inputs = amounts
      .map((value) => `<input class="civil-claim-amount" value="${value}" />`)
      .join('');
    document.body.innerHTML = `
      <div class="civil-amount-breakdown-row">
        ${inputs}
      </div>
      <span class="total-claim-amount"></span>
      <input type="hidden" class="total-claim-amount" />
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(scriptPath);
    addTotalClaimAmountCalculationEventListener = mod.addTotalClaimAmountCalculationEventListener;
  }

  it('populates visible and hidden totals on DOMContentLoaded', () => {
    loadModule(['10.5', '20']);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    expect(document.querySelector('span.total-claim-amount')!.innerHTML).toBe('30.50');
    expect((document.querySelector('input.total-claim-amount') as HTMLInputElement).value).toBe('30.50');
  });

  it('recalculates totals after debounced keyup', () => {
    loadModule(['10', '5']);
    addTotalClaimAmountCalculationEventListener();

    const amountInputs = document.querySelectorAll('.civil-claim-amount') as NodeListOf<HTMLInputElement>;
    amountInputs[0].value = '100';
    amountInputs[0].dispatchEvent(new dom.window.Event('keyup', {bubbles: true}));

    expect(document.querySelector('span.total-claim-amount')!.innerHTML).toBe('');
    jest.advanceTimersByTime(1000);

    expect(document.querySelector('span.total-claim-amount')!.innerHTML).toBe('105.00');
    expect((document.querySelector('input.total-claim-amount') as HTMLInputElement).value).toBe('105.00');
  });

  it('formats zero amounts as 0.00', () => {
    loadModule(['0', '0']);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    expect(document.querySelector('span.total-claim-amount')!.innerHTML).toBe('0.00');
  });
});
