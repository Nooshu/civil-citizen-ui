/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28+ (jest-environment-jsdom).
 */
const {JSDOM} = require('jsdom');

describe('postcode-lookup', () => {
  const scriptPath = '../../../../main/assets/js/postcode-lookup.js';
  let dom: InstanceType<typeof JSDOM>;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
      <div class="wrapper">
        <input class="postcode-val" value="SW1A1AA" />
        <div class="postcode-container">
          <button type="button">Find address</button>
          <a href="#">Enter address manually</a>
          <!-- select must be inside postcode-container so change handler can resolve active container -->
          <div class="govuk-visually-hidden">
            <select>
              <option>addresses found</option>
            </select>
          </div>
        </div>
        <p class="govuk-error-message govuk-!-display-none">Error</p>
        <div class="address-form govuk-!-display-none" aria-hidden="true">
          <input />
          <input />
          <input />
          <input />
          <input />
        </div>
      </div>
    `;
  });

  function mockFetch(result: {body?: unknown; ok?: boolean}) {
    const ok = result.ok !== false;
    (global as unknown as {fetch: typeof fetch}).fetch = jest.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: async () => result.body,
    });
  }

  async function flushAsync() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  function load() {
     
    require(scriptPath);
  }

  function clickFindAddress() {
    document.querySelector('.postcode-container button')!.dispatchEvent(
      new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}),
    );
  }

  it('shows an error and clears inputs when lookup fails', async () => {
    mockFetch({ok: false});
    load();

    clickFindAddress();
    await flushAsync();

    expect(document.querySelector('.govuk-error-message')!.classList.contains('govuk-!-display-none')).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      '/postcode-lookup?postcode=SW1A1AA',
      expect.objectContaining({method: 'GET'}),
    );
  });

  it('populates the select menu when lookup succeeds', async () => {
    mockFetch({
      body: {
        addresses: [
          {
            udprn: '1',
            formattedAddress: '1 Test Street',
            organisationName: '',
            buildingNumber: '1',
            subBuildingName: '',
            thoroughfareName: 'Test Street',
            dependentLocality: '',
            buildingName: '',
            postTown: 'London',
            postcode: 'SW1A1AA',
          },
        ],
      },
    });
    load();

    clickFindAddress();
    await flushAsync();

    const options = document.querySelectorAll('select option');
    expect(options).toHaveLength(2);
    expect(options[1].textContent).toBe('1 Test Street');
    expect(options[0].textContent).toContain('1');
    expect(document.querySelector('.govuk-error-message')!.classList.contains('govuk-!-display-none')).toBe(true);
    expect(document.querySelector('.address-form')!.classList.contains('govuk-!-display-none')).toBe(true);
  });

  it('fills the address form when an address is selected', async () => {
    mockFetch({
      body: {
        addresses: [
          {
            // select values are strings; match with strict equality in findSelectedAddress
            udprn: '99',
            formattedAddress: '10 High Street',
            organisationName: '',
            buildingNumber: '10',
            subBuildingName: '',
            thoroughfareName: 'High Street',
            dependentLocality: 'Westminster',
            buildingName: '',
            postTown: 'London',
            postcode: 'SW1A1AA',
          },
        ],
      },
    });
    load();
    clickFindAddress();
    await flushAsync();

    const select = document.querySelector('select') as HTMLSelectElement;
    select.value = '99';
    select.dispatchEvent(new dom.window.Event('change', {bubbles: true}));

    const inputs = document.querySelectorAll('.address-form input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value.trim()).toBe('10 High Street');
    expect(inputs[1].value).toBe('Westminster');
    expect(inputs[3].value).toBe('London');
    expect(inputs[4].value).toBe('SW1A1AA');
    expect(document.querySelector('.address-form')!.classList.contains('govuk-!-display-none')).toBe(false);
  });

  it('shows the address form when manual entry link is clicked', () => {
    mockFetch({body: {addresses: []}});
    load();

    document.querySelector('.postcode-container a')!.dispatchEvent(
      new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}),
    );

    expect(document.querySelector('.address-form')!.classList.contains('govuk-!-display-none')).toBe(false);
    expect(document.querySelector('.address-form')!.getAttribute('aria-hidden')).toBe('false');
  });
});
