/**
 * Progressive enhancement for address lookup.
 * Binds to macro-rendered postcode / address markup; uses fetch and native DOM APIs.
 */

(() => {
  const POSTCODE_CONTAINER_CLASS = '.postcode-container';
  const HIDDEN_CLASS = 'govuk-!-display-none';

  /** @type {HTMLElement | null} */
  let activePostcodeContainer = null;

  /** @type {Array<Record<string, string>>} */
  let addressSelected = [];

  let organisationName = '';
  let buildingNumber = '';
  let subBuildingName = '';
  let thoroughfareName = '';
  let dependentLocality = '';
  let buildingName = '';
  let postTown = '';
  let postcode = '';

  /**
   * @returns {HTMLElement | null}
   */
  const getWrapper = () => activePostcodeContainer?.parentElement ?? null;

  /**
   * @param {string} postcodeVal
   * @returns {Promise<{addresses: Array<Record<string, string>>}>}
   */
  const fetchAddresses = async (postcodeVal) => {
    const response = await fetch(
      `/postcode-lookup?postcode=${encodeURIComponent(postcodeVal)}`,
      {method: 'GET', headers: {Accept: 'application/json'}},
    );
    if (!response.ok) {
      throw new Error(`Postcode lookup failed with status ${response.status}`);
    }
    return response.json();
  };

  /**
   * @param {boolean} show
   */
  const showPostcodeError = (show) => {
    const wrapper = getWrapper();
    const postcodeErrorContainer = wrapper?.querySelector('.govuk-error-message');
    if (!postcodeErrorContainer) {
      return;
    }
    postcodeErrorContainer.classList.toggle(HIDDEN_CLASS, !show);
  };

  /**
   * @returns {HTMLElement | null}
   */
  const getFormContainer = () => getWrapper()?.querySelector('.address-form') ?? null;

  /**
   * @param {number} index
   * @returns {HTMLInputElement | null}
   */
  const getFormInput = (index) => {
    const inputs = getWrapper()?.querySelectorAll('.address-form input');
    const input = inputs?.[index] ?? null;
    return input && 'value' in input ? /** @type {HTMLInputElement} */ (input) : null;
  };

  /**
   * @returns {HTMLAnchorElement | null}
   */
  const getAnchorElement = () => getWrapper()?.querySelector('a') ?? null;

  /**
   * @param {boolean} show
   */
  const toggleForm = (show) => {
    const container = getFormContainer();
    const addressManuallyHref = getAnchorElement();
    if (!container || !addressManuallyHref) {
      return;
    }
    container.classList.toggle(HIDDEN_CLASS, !show);
    addressManuallyHref.classList.toggle(HIDDEN_CLASS, show);
    container.setAttribute('aria-hidden', show ? 'false' : 'true');
    addressManuallyHref.setAttribute('aria-hidden', show ? 'true' : 'false');
  };

  /**
   * @param {Array<Record<string, string>>} data
   */
  const addAddressesFoundValue = (data) => {
    const select = getWrapper()?.querySelector('select');
    const firstOption = select?.querySelector('option');
    if (!firstOption) {
      return;
    }
    const regex = /\d+/g;
    const text = firstOption.textContent ?? '';
    if (regex.test(text)) {
      firstOption.textContent = text.replace(regex, String(data.length));
    } else {
      firstOption.textContent = `${data.length} ${text}`;
    }
  };

  /**
   * @param {Array<Record<string, string>>} addressList
   * @param {string} val
   */
  const findSelectedAddress = (addressList, val) => {
    addressSelected = addressList.filter((item) => item.udprn === val);
    fillForm();
  };

  /**
   * @param {Array<Record<string, string>>} data
   */
  const bindDataToSelectMenu = (data) => {
    const wrapper = getWrapper();
    const select = wrapper?.querySelector('select');
    if (!select) {
      return;
    }

    const options = select.querySelectorAll('option');
    options.forEach((option, index) => {
      if (index > 0) {
        option.remove();
      }
    });

    addAddressesFoundValue(data);

    data.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.udprn;
      option.textContent = item.formattedAddress;
      option.disabled = false;
      select.appendChild(option);
    });

    const visuallyHidden = select.closest('.govuk-visually-hidden');
    visuallyHidden?.classList.remove('govuk-visually-hidden');

    select.addEventListener('change', function onAddressChange() {
      const container = this.closest(POSTCODE_CONTAINER_CLASS);
      if (container) {
        activePostcodeContainer = container;
      }
      findSelectedAddress(data, this.value);
    });
  };

  const hasAddressProperty = (property) => (property ? property : '');

  /**
   * @param {number} index
   * @param {string} value
   */
  const setFormInput = (index, value) => {
    const input = getFormInput(index);
    if (input) {
      input.value = value;
    }
  };

  const breakAddressIntoDifferentFormFields = () => {
    const spaced = ' ';

    if (organisationName !== '') {
      setFormInput(0, organisationName);
      setFormInput(
        1,
        `${buildingNumber}${spaced}${subBuildingName}${spaced}${buildingName}${spaced}${thoroughfareName}`,
      );
      setFormInput(2, dependentLocality);
    } else if (organisationName === '' && subBuildingName === '' && buildingName === '') {
      setFormInput(0, `${buildingNumber}${spaced}${thoroughfareName}`);
      setFormInput(1, dependentLocality);
    } else if (organisationName === '' && subBuildingName === '') {
      setFormInput(0, buildingName);
      setFormInput(1, thoroughfareName);
    } else {
      setFormInput(
        0,
        `${organisationName}${spaced}${buildingNumber}${spaced}${subBuildingName}${spaced}${buildingName}`,
      );
      setFormInput(1, thoroughfareName);
      setFormInput(2, dependentLocality);
    }

    setFormInput(3, postTown);
    setFormInput(4, postcode);
  };

  const fillForm = () => {
    organisationName = hasAddressProperty(addressSelected[0]?.organisationName);
    buildingNumber = hasAddressProperty(addressSelected[0]?.buildingNumber);
    subBuildingName = hasAddressProperty(addressSelected[0]?.subBuildingName);
    thoroughfareName = hasAddressProperty(addressSelected[0]?.thoroughfareName);
    dependentLocality = hasAddressProperty(addressSelected[0]?.dependentLocality);
    buildingName = hasAddressProperty(addressSelected[0]?.buildingName);
    postTown = addressSelected[0]?.postTown;
    postcode = addressSelected[0]?.postcode;

    toggleForm(true);
    getWrapper()?.querySelectorAll('.address-form input').forEach((input) => {
      input.value = '';
    });
    breakAddressIntoDifferentFormFields();
  };

  /**
   * @returns {string}
   */
  const getPostcode = () => {
    const input = getWrapper()?.querySelector('.postcode-val');
    return input && 'value' in input ? String(input.value) : '';
  };

  /**
   * @param {string} postcodeVal
   */
  const getAddressList = async (postcodeVal) => {
    try {
      const data = await fetchAddresses(postcodeVal);
      toggleForm(false);
      showPostcodeError(false);
      bindDataToSelectMenu(data.addresses);
    } catch {
      showPostcodeError(true);
      getWrapper()?.querySelectorAll('.address-form input').forEach((input) => {
        input.value = '';
      });
    }
  };

  const bindUIActions = () => {
    document.querySelectorAll(`${POSTCODE_CONTAINER_CLASS} button`).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        activePostcodeContainer = button.closest(POSTCODE_CONTAINER_CLASS);
        getAddressList(getPostcode());
      });
    });

    document.querySelectorAll(`${POSTCODE_CONTAINER_CLASS} a`).forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        activePostcodeContainer = link.closest(POSTCODE_CONTAINER_CLASS);
        toggleForm(true);
      });
    });
  };

  bindUIActions();
})();
