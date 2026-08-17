/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('calculate-length-repayment', () => {
  const scriptPath = '../../../../main/assets/js/calculate-length-repayment.js';
  let dom: InstanceType<typeof JSDOM>;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    dom.window.document.body.innerHTML = '';
    jest.resetModules();
  });

  function setupDom({
    amount = '100',
    instalments = '50',
    frequency = 'WEEK',
  }: {amount?: string; instalments?: string; frequency?: string} = {}) {
    document.body.innerHTML = `
      <input type="hidden" class="repayment-amount" value="${amount}" />
      <input class="repayment-instalments" value="${instalments}" />
      <div class="repayment-frequency">
        <input type="radio" name="repaymentFrequency" value="WEEK" ${frequency === 'WEEK' ? 'checked' : ''} />
        <input type="radio" name="repaymentFrequency" value="TWO_WEEKS" ${frequency === 'TWO_WEEKS' ? 'checked' : ''} />
        <input type="radio" name="repaymentFrequency" value="MONTH" ${frequency === 'MONTH' ? 'checked' : ''} />
      </div>
      <span id="numberOfInstalments"></span>
      <div class="schedule">
        <span id="week_schedule" class="hide">week</span>
        <span id="two-weeks_schedule" class="hide">two weeks</span>
        <span id="weeks_schedule" class="hide">weeks</span>
        <span id="month_schedule" class="hide">month</span>
        <span id="two-months_schedule" class="hide">two months</span>
        <span id="months_schedule" class="hide">months</span>
      </div>
    `;
     
    require(scriptPath);
  }

  it('hides all schedule containers on load', () => {
    setupDom();
    const schedule = document.querySelector('.schedule')!;
    Array.from(schedule.children).forEach((child) => {
      expect(child.classList.contains('hide')).toBe(true);
    });
  });

  it('shows singular week schedule when WEEK frequency yields one instalment', () => {
    setupDom({amount: '50', instalments: '50', frequency: 'WEEK'});
    window.dispatchEvent(new dom.window.Event('load'));

    expect(document.getElementById('numberOfInstalments')!.innerHTML).toBe('1');
    expect(document.getElementById('week_schedule')!.classList.contains('hide')).toBe(false);
    expect(document.getElementById('weeks_schedule')!.classList.contains('hide')).toBe(true);
  });

  it('shows weeks schedule when WEEK frequency yields more than two instalments', () => {
    setupDom({amount: '100', instalments: '25', frequency: 'WEEK'});
    window.dispatchEvent(new dom.window.Event('load'));

    expect(document.getElementById('numberOfInstalments')!.innerHTML).toBe('4');
    expect(document.getElementById('weeks_schedule')!.classList.contains('hide')).toBe(false);
    expect(document.getElementById('week_schedule')!.classList.contains('hide')).toBe(true);
  });

  it('doubles instalments for TWO_WEEKS frequency', () => {
    setupDom({amount: '100', instalments: '50', frequency: 'TWO_WEEKS'});
    window.dispatchEvent(new dom.window.Event('load'));

    // ceil(100/50)=2, then *2 => 4
    expect(document.getElementById('numberOfInstalments')!.innerHTML).toBe('4');
    expect(document.getElementById('weeks_schedule')!.classList.contains('hide')).toBe(false);
  });

  it('shows month schedule for MONTH frequency with one instalment', () => {
    setupDom({amount: '100', instalments: '100', frequency: 'MONTH'});
    window.dispatchEvent(new dom.window.Event('load'));

    expect(document.getElementById('numberOfInstalments')!.innerHTML).toBe('1');
    expect(document.getElementById('month_schedule')!.classList.contains('hide')).toBe(false);
  });

  it('recalculates when instalments value changes', () => {
    setupDom({amount: '100', instalments: '100', frequency: 'WEEK'});
    window.dispatchEvent(new dom.window.Event('load'));
    expect(document.getElementById('week_schedule')!.classList.contains('hide')).toBe(false);

    const instalments = document.querySelector('.repayment-instalments') as HTMLInputElement;
    instalments.value = '25';
    instalments.dispatchEvent(new dom.window.Event('keyup', {bubbles: true}));

    expect(document.getElementById('numberOfInstalments')!.innerHTML).toBe('4');
    expect(document.getElementById('weeks_schedule')!.classList.contains('hide')).toBe(false);
  });

  it('recalculates when frequency radio is clicked', () => {
    setupDom({amount: '100', instalments: '100', frequency: 'WEEK'});
    const monthRadio = document.querySelector('input[value="MONTH"]') as HTMLInputElement;
    monthRadio.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));
    // click handler uses event.target.value — set target via dispatch on the input
    document.querySelector('.repayment-frequency')!.dispatchEvent(
      new dom.window.MouseEvent('click', {bubbles: true}),
    );
    // Directly invoke by clicking the radio (bubbles to repayment-frequency)
    monthRadio.checked = true;
    const clickEvent = new dom.window.MouseEvent('click', {bubbles: true});
    Object.defineProperty(clickEvent, 'target', {value: monthRadio});
    document.querySelector('.repayment-frequency')!.dispatchEvent(clickEvent);

    expect(document.getElementById('month_schedule')!.classList.contains('hide')).toBe(false);
  });
});
