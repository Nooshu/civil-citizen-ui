/**
 * Reindex action buttons (upload/remove) inside newly added Add another rows.
 * `add-another.js` updates inputs from data-name/data-id placeholders, but not
 * button values. This script does the same for buttons with a `data-value`
 * placeholder.
 *
 * This is app JS. It is not Ministry of Justice (MoJ) Frontend.
 */
(function () {
  const ADD_BUTTON_SELECTOR = '.cui-add-another__add-button';
  const CONTAINER_SELECTOR = '[data-module="cui-add-another"]';
  const ITEM_SELECTOR = '.cui-add-another__item';
  const ACTION_BUTTON_SELECTOR = 'button[name="action"][data-value]';

  const reindexButtonsInItem = (itemEl, newIndex) => {
    const buttons = itemEl.querySelectorAll(ACTION_BUTTON_SELECTOR);
    buttons.forEach((btn) => {
      const template = btn.getAttribute('data-value');
      if (template) {
        btn.value = template.replace('%index%', String(newIndex));
      }
    });
  };

  const onAddAnotherClicked = (evt) => {
    const addBtn = evt.currentTarget;
    const container = addBtn.closest(CONTAINER_SELECTOR);
    if (!container) return;

    // Allow add-another.js time to clone the new item
    setTimeout(() => {
      const items = container.querySelectorAll(ITEM_SELECTOR);
      if (!items || items.length === 0) return;
      const newIndex = items.length - 1;
      const lastItem = items[items.length - 1];
      reindexButtonsInItem(lastItem, newIndex);
    }, 0);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(ADD_BUTTON_SELECTOR).forEach((btn) => {
      btn.addEventListener('click', onAddAnotherClicked);
    });
  });
})();
