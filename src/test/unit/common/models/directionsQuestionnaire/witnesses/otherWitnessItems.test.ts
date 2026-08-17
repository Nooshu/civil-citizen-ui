import {GenericForm} from 'common/form/models/genericForm';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';

describe('OtherWitnessItems', () => {
  describe('constructor', () => {
    it('should trim names and assign optional contact fields', () => {
      const witness = new OtherWitnessItems({
        firstName: '  Jane  ',
        lastName: '  Doe ',
        email: 'jane@example.com',
        telephone: '07700900000',
        details: 'Saw the incident',
      });

      expect(witness.firstName).toBe('Jane');
      expect(witness.lastName).toBe('Doe');
      expect(witness.email).toBe('jane@example.com');
      expect(witness.telephone).toBe('07700900000');
      expect(witness.details).toBe('Saw the incident');
    });

    it('should leave trimmed names undefined when missing', () => {
      const witness = new OtherWitnessItems({
        email: undefined,
        telephone: undefined,
        details: 'details',
      });

      expect(witness.firstName).toBeUndefined();
      expect(witness.lastName).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should pass for a complete valid witness', async () => {
      const form = new GenericForm(new OtherWitnessItems({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        telephone: '07700900000',
        details: 'Witnessed the event',
      }));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require first name, last name and details', async () => {
      const form = new GenericForm(new OtherWitnessItems({}));

      await form.validate();

      expect(form.errorFor('firstName')).toBe('ERRORS.DEFENDANT_WITNESS_ENTER_FIRST_NAME');
      expect(form.errorFor('lastName')).toBe('ERRORS.DEFENDANT_WITNESS_ENTER_LAST_NAME');
      expect(form.errorFor('details')).toBe('ERRORS.DEFENDANT_WITNESS_WHAT_THEY_WITNESSED');
    });

    it('should validate optional email and telephone when provided', async () => {
      const form = new GenericForm(new OtherWitnessItems({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'bad-email',
        telephone: 'bad-phone',
        details: 'details',
      }));

      await form.validate();

      expect(form.errorFor('email')).toBe('ERRORS.ENTER_VALID_EMAIL');
      expect(form.errorFor('telephone')).toBe('ERRORS.VALID_PHONE_NUMBER');
    });

    it('should skip email and telephone validation when empty', async () => {
      const form = new GenericForm(new OtherWitnessItems({
        firstName: 'Jane',
        lastName: 'Doe',
        details: 'details',
      }));

      await form.validate();

      expect(form.errorFor('email')).toBeUndefined();
      expect(form.errorFor('telephone')).toBeUndefined();
      expect(form.hasErrors()).toBeFalsy();
    });
  });
});
