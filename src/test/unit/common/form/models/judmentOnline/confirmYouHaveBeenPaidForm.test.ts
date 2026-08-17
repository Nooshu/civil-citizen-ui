import {GenericForm} from 'common/form/models/genericForm';
import {DateYouHaveBeenPaidForm} from 'form/models/judmentOnline/confirmYouHaveBeenPaidForm';

describe('DateYouHaveBeenPaidForm', () => {
  describe('constructor', () => {
    it('should set date fields when all date parts are provided', () => {
      const joIssuedDate = new Date(2024, 0, 1);
      const form = new DateYouHaveBeenPaidForm('2024', '6', '15', true, joIssuedDate);

      expect(form.year).toBe(2024);
      expect(form.month).toBe(6);
      expect(form.day).toBe(15);
      expect(form.confirmed).toBe(true);
      expect(form.joIssuedDate).toEqual(joIssuedDate);
      expect(form.date).toEqual(new Date(2024, 5, 15));
    });

    it('should leave fields unset when date parts are incomplete', () => {
      const form = new DateYouHaveBeenPaidForm('2024', '6');

      expect(form.year).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.date).toBeUndefined();
      expect(form.confirmed).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should pass for a valid confirmed paid date after judgment', async () => {
      const joIssuedDate = new Date(2024, 0, 1);
      const form = new GenericForm(
        new DateYouHaveBeenPaidForm('2024', '6', '15', true, joIssuedDate),
      );

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require confirmation', async () => {
      const joIssuedDate = new Date(2024, 0, 1);
      const form = new GenericForm(
        new DateYouHaveBeenPaidForm('2024', '6', '15', undefined, joIssuedDate),
      );

      await form.validate();

      expect(form.errorFor('confirmed')).toBe('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.CHECK_ERROR_MESSAGE');
    });

    it('should reject invalid month and day', async () => {
      const form = new GenericForm(new DateYouHaveBeenPaidForm('2024', '13', '32', true, new Date(2024, 0, 1)));

      await form.validate();

      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
    });

    it('should reject date before judgment issued date', async () => {
      const joIssuedDate = new Date(2024, 5, 15);
      const form = new GenericForm(
        new DateYouHaveBeenPaidForm('2024', '1', '1', true, joIssuedDate),
      );

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.VALID_PAID_IN_FULL_DATE');
    });

    it('should reject future dates', async () => {
      const futureYear = new Date().getFullYear() + 2;
      const form = new GenericForm(
        new DateYouHaveBeenPaidForm(String(futureYear), '1', '1', true, new Date(2020, 0, 1)),
      );

      await form.validate();

      expect(form.errorFor('date')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
    });
  });
});
