import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

describe('PhoneUKValidator', () => {
  const validator = new PhoneUKValidator();

  describe('validate', () => {
    it('should return true for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid UK landline', () => {
      //Given
      //When
      const result = validator.validate('02079460000');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid UK mobile', () => {
      //Given
      //When
      const result = validator.validate('07911123456');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid +44 format', () => {
      //Given
      //When
      const result = validator.validate('+442079460000');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for invalid phone number', () => {
      //Given
      //When
      const result = validator.validate('123');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for letters', () => {
      //Given
      //When
      const result = validator.validate('abcdefghij');
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
