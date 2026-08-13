/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28.
 */
const {JSDOM} = require('jsdom');

describe('cookies-controller', () => {
  const scriptPath = '../../../../main/assets/js/cookies-controller.js';
  let dom: InstanceType<typeof JSDOM>;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('reveals success notification banners when cookies submit is clicked', () => {
    document.body.innerHTML = `
      <button id="cui-cookies-submit">Save</button>
      <div class="govuk-notification-banner--success govuk-visually-hidden">Saved</div>
      <div class="govuk-notification-banner--success govuk-visually-hidden">Also saved</div>
    `;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);

    document.getElementById('cui-cookies-submit')!.dispatchEvent(new dom.window.MouseEvent('click'));

    const banners = document.getElementsByClassName('govuk-notification-banner--success');
    expect(banners[0].classList.contains('govuk-visually-hidden')).toBe(false);
    expect(banners[1].classList.contains('govuk-visually-hidden')).toBe(false);
  });

  it('does nothing when submit button is missing', () => {
    document.body.innerHTML = `
      <div class="govuk-notification-banner--success govuk-visually-hidden">Saved</div>
    `;
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(scriptPath);
    }).not.toThrow();
    expect(document.querySelector('.govuk-notification-banner--success')!.classList.contains('govuk-visually-hidden')).toBe(true);
  });
});
