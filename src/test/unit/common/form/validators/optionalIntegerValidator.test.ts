import {OptionalIntegerValidator} from 'form/validators/optionalIntegerValidator';

describe('OptionalIntegerValidator', () => {
  const validator = new OptionalIntegerValidator();

  describe('validate', () => {
    it('should return true for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for a valid integer string', () => {
      //Given
      //When
      const result = validator.validate('123');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for zero', () => {
      //Given
      //When
      const result = validator.validate('0');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for decimal number', () => {
      //Given
      //When
      const result = validator.validate('12.5');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for letters', () => {
      //Given
      //When
      const result = validator.validate('abc');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for negative number', () => {
      //Given
      //When
      const result = validator.validate('-5');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for special characters', () => {
      //Given
      //When
      const result = validator.validate('12#');
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
      expect(message).toEqual('ERRORS.VALID_PHONE_NUMBER');
    });
  });
});
