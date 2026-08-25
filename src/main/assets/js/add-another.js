import {initAppendRow} from './append-row.js';

export {initAppendRow};

/**
 * Repeatable form rows using CUI’s existing Add another markup.
 *
 * Binds `[data-module="cui-add-another"]` that contain `.cui-add-another__items`.
 * Without that wrapper this module does nothing, so journeys that add rows by
 * server POST (mediation uploads) keep working.
 *
 * Also starts {@link initAppendRow} for `.append-row` / `.row-container` markup
 * (timeline, expenses, employers, directions questionnaire). That is a second
 * DOM contract, not a rewrite of those journeys onto `%index%` placeholders.
 *
 * Class names use the `cui-add-another*` app prefix (Civil Citizen UI). They are
 * not the `@ministryofjustice/frontend` package.
 *
 * @param scope - Document or container to search
 */
export function initAddAnother(scope = document) {
  scope.querySelectorAll('[data-module="cui-add-another"]').forEach((root) => {
    bindRoot(root);
  });
  initAppendRow(scope);
}

/**
 * @param {Node | null} node - Candidate node
 * @returns {node is Element}
 */
function isElement(node) {
  return !!node && node.nodeType === 1;
}

/**
 * @param {Element} root - Add another root
 */
function bindRoot(root) {
  const itemsContainer = root.querySelector('.cui-add-another__items');
  if (!isElement(itemsContainer)) {
    return;
  }

  root.querySelectorAll('.cui-add-another__add-button, .cui-add-another__remove-button')
    .forEach((button) => {
      if (button.tagName === 'BUTTON') {
        button.type = 'button';
      }
    });

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!isElement(target)) {
      return;
    }

    const addButton = target.closest('.cui-add-another__add-button');
    if (addButton && root.contains(addButton)) {
      event.preventDefault();
      addItem(itemsContainer);
      return;
    }

    const removeButton = target.closest('.cui-add-another__remove-button');
    if (removeButton && root.contains(removeButton)) {
      event.preventDefault();
      removeItem(itemsContainer, removeButton);
    }
  });
}

/**
 * @param {Element} itemsContainer - Items wrapper
 */
function addItem(itemsContainer) {
  const source = itemsContainer.querySelector('.cui-add-another__item');
  if (!isElement(source)) {
    return;
  }
  const clone = source.cloneNode(true);
  if (!isElement(clone)) {
    return;
  }
  resetFields(clone);
  itemsContainer.appendChild(clone);
  reindex(itemsContainer);
}

/**
 * @param {Element} itemsContainer - Items wrapper
 * @param {Element} removeButton - Remove control
 */
function removeItem(itemsContainer, removeButton) {
  const item = removeButton.closest('.cui-add-another__item');
  if (!isElement(item)) {
    return;
  }
  const items = itemsContainer.querySelectorAll('.cui-add-another__item');
  if (items.length < 2) {
    return;
  }
  item.remove();
  reindex(itemsContainer);
}

/**
 * @param {Element} itemsContainer - Items wrapper
 */
function reindex(itemsContainer) {
  itemsContainer.querySelectorAll('.cui-add-another__item').forEach((item, index) => {
    item.querySelectorAll('[data-name][data-id]').forEach((field) => {
      const name = field.getAttribute('data-name') || '';
      const id = field.getAttribute('data-id') || '';
      if ('name' in field) {
        field.name = name.replace('%index%', String(index));
      }
      field.id = id.replace('%index%', String(index));
    });
  });
}

/**
 * @param {Element} item - Cloned row
 */
function resetFields(item) {
  item.querySelectorAll('input, select, textarea').forEach((field) => {
    const type = 'type' in field ? field.type : '';
    if (type === 'checkbox' || type === 'radio') {
      field.checked = false;
      return;
    }
    if (type === 'hidden' || type === 'button' || type === 'submit') {
      return;
    }
    if ('value' in field) {
      field.value = '';
    }
  });
  item.querySelectorAll('.govuk-error-message, .govuk-error-summary').forEach((el) => el.remove());
  item.querySelectorAll('.govuk-form-group--error').forEach((el) => {
    el.classList.remove('govuk-form-group--error');
  });
  item.querySelectorAll('.govuk-input--error, .govuk-select--error, .govuk-textarea--error')
    .forEach((el) => {
      el.classList.remove('govuk-input--error', 'govuk-select--error', 'govuk-textarea--error');
    });
}
