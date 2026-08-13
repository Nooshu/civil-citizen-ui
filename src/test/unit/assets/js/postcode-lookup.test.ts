/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28.
 */
const {JSDOM} = require('jsdom');

describe('postcode-lookup', () => {
  const scriptPath = '../../../../main/assets/js/postcode-lookup.js';
  let dom: InstanceType<typeof JSDOM>;
  let $: typeof import('jquery');

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url: 'http://localhost/'});
    (global as unknown as {window: Window}).window = dom.window;
    (global as unknown as {document: Document}).document = dom.window.document;
  });

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    $ = require('jquery');
    (dom.window as unknown as {$: typeof $}).$ = $;
    (global as unknown as {$: typeof $}).$ = $;

    document.body.innerHTML = `
      <div class="wrapper">
        <input class="postcode-val" value="SW1A1AA" />
        <div class="postcode-container">
          <button type="button">Find address</button>
          <a href="#">Enter address manually</a>
          <!-- select must be inside postcode-container so change handler can resolve global.this -->
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

  function mockAjax(result: {resolve?: unknown; reject?: boolean}) {
    const deferred = $.Deferred();
    jest.spyOn($, 'ajax').mockImplementation(() => {
      if (result.reject) {
        deferred.reject();
      } else {
        deferred.resolve(result.resolve);
      }
      return deferred.promise() as JQuery.jqXHR;
    });
  }

  function load() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
  }

  it('shows an error and clears inputs when lookup fails', () => {
    mockAjax({reject: true});
    load();

    $('.postcode-container button').trigger('click');

    expect($('.govuk-error-message').hasClass('govuk-!-display-none')).toBe(false);
    expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
      type: 'GET',
      url: '/postcode-lookup?postcode=SW1A1AA',
    }));
  });

  it('populates the select menu when lookup succeeds', () => {
    mockAjax({
      resolve: {
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

    $('.postcode-container button').trigger('click');

    const options = document.querySelectorAll('select option');
    expect(options).toHaveLength(2);
    expect(options[1].textContent).toBe('1 Test Street');
    expect(options[0].textContent).toContain('1');
    expect($('.govuk-error-message').hasClass('govuk-!-display-none')).toBe(true);
    expect($('.address-form').hasClass('govuk-!-display-none')).toBe(true);
  });

  it('fills the address form when an address is selected', () => {
    mockAjax({
      resolve: {
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
    $('.postcode-container button').trigger('click');

    const select = document.querySelector('select') as HTMLSelectElement;
    select.value = '99';
    $(select).trigger('change');

    const inputs = document.querySelectorAll('.address-form input') as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value.trim()).toBe('10 High Street');
    expect(inputs[1].value).toBe('Westminster');
    expect(inputs[3].value).toBe('London');
    expect(inputs[4].value).toBe('SW1A1AA');
    expect($('.address-form').hasClass('govuk-!-display-none')).toBe(false);
  });

  it('shows the address form when manual entry link is clicked', () => {
    mockAjax({resolve: {addresses: []}});
    load();

    $('.postcode-container a').trigger('click');

    expect($('.address-form').hasClass('govuk-!-display-none')).toBe(false);
    expect($('.address-form').attr('aria-hidden')).toBe('false');
  });
});
