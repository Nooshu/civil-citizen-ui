import {EmailValidator} from 'form/validators/emailValidator';

describe('EmailValidator', () => {
  const validator = new EmailValidator();

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

    it('should return true for a valid email', () => {
      //Given
      //When
      const result = validator.validate('test@example.com');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for email with subdomain', () => {
      //Given
      //When
      const result = validator.validate('user.name@mail.example.co.uk');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for email without at sign', () => {
      //Given
      //When
      const result = validator.validate('testexample.com');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for email without domain', () => {
      //Given
      //When
      const result = validator.validate('test@');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for email exceeding max length', () => {
      //Given
      const longLocal = 'a'.repeat(310);
      const value = `${longLocal}@ex.com`;
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for invalid TLD length', () => {
      //Given
      //When
      const result = validator.validate('test@example.toolongtld');
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
      expect(message).toEqual('ERRORS.ENTER_VALID_EMAIL');
    });
  });
});
