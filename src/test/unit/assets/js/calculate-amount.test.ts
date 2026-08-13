/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('calculate-amount', () => {
  const scriptPath = '../../../../main/assets/js/calculate-amount.js';
  let dom: InstanceType<typeof JSDOM>;
  let getCalculation: () => Promise<void>;
  let addCalculationEventListener: () => void;
  let debounce: (func: (...args: unknown[]) => void, delay: number) => (...args: unknown[]) => void;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    dom.window.document.body.innerHTML = '';
    jest.resetModules();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function amountRowHtml({
    amount = '100',
    schedule = 'WEEK',
    checked = true,
    hidden = false,
  }: {amount?: string; schedule?: string; checked?: boolean; hidden?: boolean} = {}) {
    return `
      <div class="govuk-checkboxes__conditional${hidden ? ' govuk-checkboxes__conditional--hidden' : ''}">
        <div class="civil-amountRow">
          <input class="civil-amount" value="${amount}" />
          <div class="civil-schedule">
            <input type="radio" name="schedule" value="${schedule}" ${checked ? 'checked' : ''} />
            <input type="radio" name="schedule" value="MONTH" />
          </div>
        </div>
      </div>
    `;
  }

  function loadModule(html: string) {
    document.body.innerHTML = `
      <input type="hidden" name="_csrf" value="csrf-token" />
      <span class="total-monthly-income-expense"></span>
      ${html}
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(scriptPath);
    getCalculation = mod.getCalculation;
    addCalculationEventListener = mod.addCalculationEventListener;
    debounce = mod.debounce;
  }

  describe('debounce', () => {
    it('delays invoking the function until after delay ms', () => {
      loadModule('');
      const fn = jest.fn();
      const debounced = debounce(fn, 1000);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(999);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets the timer when called again before delay elapses', () => {
      loadModule('');
      const fn = jest.fn();
      const debounced = debounce(fn, 1000);

      debounced();
      jest.advanceTimersByTime(500);
      debounced();
      jest.advanceTimersByTime(500);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCalculation', () => {
    it('sets total to 0 when no amounts have values', async () => {
      loadModule(amountRowHtml({amount: '', checked: false}));

      await getCalculation();

      expect(document.querySelector('.total-monthly-income-expense')!.innerHTML).toBe('0');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('posts selected amounts and writes the response into the total element', async () => {
      loadModule(amountRowHtml({amount: '50', schedule: 'WEEK', checked: true}));
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => '200.00',
      });

      await getCalculation();

      expect(global.fetch).toHaveBeenCalledWith(
        '/total-income-expense-calculation',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'CSRF-Token': 'csrf-token',
          }),
          body: JSON.stringify([{amount: '50', schedule: 'WEEK'}]),
        }),
      );
      expect(document.querySelector('.total-monthly-income-expense')!.innerHTML).toBe('200.00');
    });

    it('excludes rows inside a hidden checkbox conditional', async () => {
      loadModule(amountRowHtml({amount: '50', checked: true, hidden: true}));

      await getCalculation();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(document.querySelector('.total-monthly-income-expense')!.innerHTML).toBe('0');
    });

    it('includes multiple rows with selected schedules', async () => {
      loadModule(`
        ${amountRowHtml({amount: '10', schedule: 'WEEK', checked: true})}
        ${amountRowHtml({amount: '20', schedule: 'MONTH', checked: true})}
      `);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => '30.00',
      });

      await getCalculation();

      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual([
        {amount: '10', schedule: 'WEEK'},
        {amount: '20', schedule: 'MONTH'},
      ]);
    });
  });

  describe('addCalculationEventListener', () => {
    it('recalculates on schedule change', async () => {
      loadModule(amountRowHtml({amount: '50', schedule: 'WEEK', checked: true}));
      (global.fetch as jest.Mock).mockResolvedValue({json: async () => '100'});
      addCalculationEventListener();

      const radios = document.querySelectorAll('.civil-schedule input') as NodeListOf<HTMLInputElement>;
      radios[0].checked = false;
      radios[1].checked = true;
      radios[1].dispatchEvent(new dom.window.Event('change', {bubbles: true}));

      await Promise.resolve();
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalled();
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual([
        {amount: '50', schedule: 'MONTH'},
      ]);
    });

    it('debounces recalculation on amount keyup', async () => {
      loadModule(amountRowHtml({amount: '50', schedule: 'WEEK', checked: true}));
      (global.fetch as jest.Mock).mockResolvedValue({json: async () => '999'});
      addCalculationEventListener();

      const amountInput = document.querySelector('.civil-amount') as HTMLInputElement;
      amountInput.value = '75';
      amountInput.dispatchEvent(new dom.window.Event('keyup', {bubbles: true}));

      expect(global.fetch).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalled();
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual([
        {amount: '75', schedule: 'WEEK'},
      ]);
    });
  });
});
