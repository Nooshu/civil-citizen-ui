import {OptionalDateNotInPastValidator} from 'form/validators/optionalDateNotInPastValidator';

describe('OptionalDateNotInPastValidator', () => {
  const validator = new OptionalDateNotInPastValidator();

  describe('validate', () => {
    it('should return true for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for today', () => {
      //Given
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(today);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for a date in the future', () => {
      //Given
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(futureDate);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for a date in the past', () => {
      //Given
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(0, 0, 0, 0);
      //When
      const result = validator.validate(pastDate);
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {
      //Given
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_DATE_NOT_IN_PAST');
    });
  });
});
