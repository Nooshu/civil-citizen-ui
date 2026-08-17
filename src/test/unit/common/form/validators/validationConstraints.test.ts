import {
  ADDRESS_LINE_MAX_LENGTH_JO,
  FREE_TEXT_1000_MAX_LENGTH,
  FREE_TEXT_MAX_LENGTH,
  MAX_AMOUNT_VALUE,
  MAX_CLAIM_AMOUNT_TOTAL,
  MIN_AMOUNT_VALUE,
  SIGNER_NAME_MAX_LENGTH,
  SIGNER_ROLE_MAX_LENGTH,
} from 'form/validators/validationConstraints';

describe('validationConstraints', () => {
  it('should export MAX_AMOUNT_VALUE with expected value', () => {
    //Given
    //When
    //Then
    expect(MAX_AMOUNT_VALUE).toEqual(999999999999999);
  });

  it('should export FREE_TEXT_MAX_LENGTH with expected value', () => {
    //Given
    //When
    //Then
    expect(FREE_TEXT_MAX_LENGTH).toEqual(99000);
  });

  it('should export FREE_TEXT_1000_MAX_LENGTH with expected value', () => {
    //Given
    //When
    //Then
    expect(FREE_TEXT_1000_MAX_LENGTH).toEqual(1000);
  });

  it('should export MIN_AMOUNT_VALUE with expected value', () => {
    //Given
    //When
    //Then
    expect(MIN_AMOUNT_VALUE).toEqual(0.01);
  });

  it('should export SIGNER_NAME_MAX_LENGTH with expected value', () => {
    //Given
    //When
    //Then
    expect(SIGNER_NAME_MAX_LENGTH).toEqual(70);
  });

  it('should export SIGNER_ROLE_MAX_LENGTH with expected value', () => {
    //Given
    //When
    //Then
    expect(SIGNER_ROLE_MAX_LENGTH).toEqual(70);
  });

  it('should export MAX_CLAIM_AMOUNT_TOTAL with expected value', () => {
    //Given
    //When
    //Then
    expect(MAX_CLAIM_AMOUNT_TOTAL).toEqual(25000);
  });

  it('should export ADDRESS_LINE_MAX_LENGTH_JO with expected value', () => {
    //Given
    //When
    //Then
    expect(ADDRESS_LINE_MAX_LENGTH_JO).toEqual(35);
  });
});
