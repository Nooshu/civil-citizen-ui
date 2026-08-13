import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';

describe('OptionalDateFourDigitValidator', () => {
  const validator = new OptionalDateFourDigitValidator();

  describe('validate', () => {
    it('should return true for NaN', () => {
      //Given
      //When
      const result = validator.validate(NaN);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for year 1000', () => {
      //Given
      //When
      const result = validator.validate(1000);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for year greater than 1000', () => {
      //Given
      //When
      const result = validator.validate(2024);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for year less than 1000', () => {
      //Given
      //When
      const result = validator.validate(999);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for year 0', () => {
      //Given
      //When
      const result = validator.validate(0);
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
      expect(message).toEqual('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });
  });
});
