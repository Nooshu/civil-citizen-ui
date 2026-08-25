/**
 * Select menu toggle for an expandable panel.
 * Wrap the select and panel in a DIV with class `select-toggle`.
 * Use class `panel` and optionally `panel-border-narrow` for a left border.
 *
 * Example:
 * ```html
 * <div class="select-toggle">
 *   <!-- govukSelect macro -->
 *   <div class="panel panel-border-narrow govuk-visually-hidden">
 *     <!-- panel content -->
 *   </div>
 * </div>
 * ```
 */

(() => {
  const settings = {
    parent: '.select-toggle',
    child: '.govuk-select',
    panel: '.panel',
    hiddenClass: 'govuk-visually-hidden',
    addAnotherButton: '.cui-add-another__add-button',
  };

  /**
   * @param {HTMLElement} panel
   * @param {number} optionIndex
   */
  const toggleDetails = (panel, optionIndex) => {
    const details = panel.querySelectorAll('span');
    details.forEach((detail) => {
      detail.classList.add(settings.hiddenClass);
    });
    const target = details[optionIndex - 1];
    target?.classList.remove(settings.hiddenClass);
  };

  /**
   * @param {string} optionVal
   * @param {HTMLElement} panel
   */
  const togglePanel = (optionVal, panel) => {
    if (optionVal) {
      panel.classList.remove(settings.hiddenClass);
    } else {
      panel.classList.add(settings.hiddenClass);
    }
    // Match legacy jQuery behaviour: always clear textareas on change.
    panel.querySelectorAll('textarea').forEach((textarea) => {
      textarea.value = '';
    });
  };

  /**
   * @param {HTMLSelectElement} select
   * @returns {HTMLElement | null}
   */
  const findPanel = (select) => {
    const parent = select.closest(settings.parent);
    return parent?.querySelector(settings.panel) ?? null;
  };

  /**
   * @param {typeof settings} params
   */
  const setSelectToggle = (params) => {
    document.querySelectorAll(`${params.parent} ${params.child}`).forEach((element) => {
      if (element.tagName !== 'SELECT') {
        return;
      }
      const select = /** @type {HTMLSelectElement} */ (element);
      if (select.dataset.selectToggleBound === 'true') {
        return;
      }
      select.dataset.selectToggleBound = 'true';
      select.addEventListener('change', () => {
        const optionVal = select.value;
        const optionIndex = select.selectedIndex;
        const panel = findPanel(select);
        if (!panel) {
          return;
        }
        togglePanel(optionVal, panel);
        if (optionVal) {
          toggleDetails(panel, optionIndex);
        }
      });
    });
  };

  /**
   * @param {typeof settings} _settings
   */
  const init = (_settings) => {
    document.querySelectorAll(`${_settings.parent} ${_settings.addAnotherButton}`).forEach((button) => {
      button.addEventListener('click', () => {
        setTimeout(() => {
          setSelectToggle(_settings);
          const panels = document.querySelectorAll(_settings.panel);
          const lastPanel = panels[panels.length - 1];
          lastPanel?.classList.add(_settings.hiddenClass);
        }, 0);
      });
    });

    setSelectToggle(_settings);
  };

  init(settings);
})();
