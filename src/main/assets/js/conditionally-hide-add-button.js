/**
 * Hide the Add another button once `maximumNumberOfRows` is reached.
 *
 * Pages that use `cui-add-another` can reuse this by giving the add button an
 * `id` (class `cui-add-another__add-button`) and adding the id plus the max
 * row count to the map below.
 *
 * This is app JS. It is not Ministry of Justice (MoJ) Frontend.
 */
const maximumNumberOfRowsByButtonId = [
  {
    buttonId: 'add-another-court-order',
    maximumNumberOfRows: 10,
  },
];

maximumNumberOfRowsByButtonId.forEach(entry => {
  const addButton = document.getElementById(entry.buttonId);
  addButton?.addEventListener('click', () => {
    const addAnotherItemsCount = [...document.getElementsByClassName('cui-add-another__item')].length;
    if (addAnotherItemsCount > entry.maximumNumberOfRows - 2) {
      addButton.classList.add('hide');
    }
  });
});