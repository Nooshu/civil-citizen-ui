import {OptionalDateInPastValidator} from 'form/validators/optionalDateInPastValidator';

describe('OptionalDateInPastValidator', () => {
  const validator = new OptionalDateInPastValidator();

  describe('validate', () => {
    it('should return true for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for Invalid Date', () => {
      //Given
      const invalidDate = new Date('invalid');
      //When
      const result = validator.validate(invalidDate);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for a date in the past', () => {
      //Given
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(pastDate);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for today', () => {
      //Given
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(today);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for a date in the future', () => {
      //Given
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(futureDate);
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message including today', () => {
      //Given
      const expectedToday = new Date(Date.now()).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_DATE_IN_PAST' + expectedToday);
    });
  });
});
