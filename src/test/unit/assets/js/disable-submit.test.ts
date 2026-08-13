/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('disable-submit', () => {
  const scriptPath = '../../../../main/assets/js/disable-submit.js';

  function setup(pathname: string) {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>
        <form>
          <button class="govuk-button" type="submit">Pay</button>
        </form>
      </body></html>`,
      {url: `http://localhost${pathname}`},
    );
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    return dom;
  }

  it.each([
    '/claim/12345/fee',
    '/case/99/case-progression/pay-hearing-fee/apply-help-fee-selection',
    '/case/99/case-progression/make-payment-again',
    '/case/99/general-application/apply-help-fee-selection',
    '/case/99/general-application/1/apply-help-additional-fee-selection',
  ])('disables submit button on matching payment path %s', (pathname) => {
    const dom = setup(pathname);
    const form = document.querySelector('form')!;
    const button = document.querySelector('.govuk-button') as HTMLButtonElement;

    const event = new dom.window.Event('submit', {bubbles: true, cancelable: true});
    Object.defineProperty(event, 'target', {value: form});
    form.onsubmit!(event as unknown as SubmitEvent);

    expect(button.disabled).toBe(true);
  });

  it('does not attach handler on non-matching paths', () => {
    setup('/claim/12345/details');
    const form = document.querySelector('form')!;
    expect(form.onsubmit).toBeNull();
  });
});
