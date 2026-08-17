import { Address } from 'common/form/models/address';
import { GenericForm } from 'common/form/models/genericForm';
import * as ordnanceSurveyService from '../../../../../main/modules/ordance-survey-key/ordanceSurveyKeyService';

jest.mock('../../../../../main/modules/ordance-survey-key/ordanceSurveyKeyService');

const mockLookupByPostcode = ordnanceSurveyService.lookupByPostcodeAndDataSet as jest.Mock;
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';
const postCode = ' EC1A 1BB ';
const stringWithSpecialChar1 = ' SpecialChar ˆ 1';
const stringWithSpecialChar2 = ' SpecialChar ` 2';
const stringWithSpecialChar3 = ' SpecialChar ´ 3';
const stringWithSpecialChar4 = ' SpecialChar ¨ 4';

describe(('For Address Form'), () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // Default: postcode always valid (England)
    mockLookupByPostcode.mockResolvedValue({
      valid: true,
      addresses: [{ country: 'England' }],
    });
  });

  describe('helpers', () => {
    it('should report empty when all fields are blank', () => {
      expect(new Address().isEmpty()).toBeTruthy();
      expect(new Address('', '', '', '', '').isEmpty()).toBeTruthy();
    });

    it('should report not empty when any field is set', () => {
      expect(new Address('1 High Street').isEmpty()).toBeFalsy();
    });

    it('should build Address.fromObject with indexed fields', () => {
      const address = Address.fromObject({
        addressLine1: ['Line 1'],
        addressLine2: ['Line 2'],
        addressLine3: ['Line 3'],
        city: ['London'],
        postCode: ['SW1A 1AA'],
      } as unknown as Record<string, string>, 0);
      expect(address.addressLine1).toBe('Line 1');
      expect(address.city).toBe('London');
      expect(address.postCode).toBe('SW1A 1AA');
    });

    it('should return empty Address.fromObject when addressLine1 missing', () => {
      const address = Address.fromObject({city: ['London']} as unknown as Record<string, string>, 0);
      expect(address.isEmpty()).toBeTruthy();
    });

    it('should build Address.fromObject with empty optional indexed fields', () => {
      const address = Address.fromObject({
        addressLine1: ['Only line'],
        addressLine2: [''],
        addressLine3: [''],
        city: [''],
        postCode: [''],
      } as unknown as Record<string, string>, 0);
      expect(address.addressLine1).toBe('Only line');
      expect(address.isEmpty()).toBeFalsy();
    });
  });

  describe('judgment online validation', () => {
    it('should not throw error if address length OK', async () => {
      //Given
      const address = new Address(string35charLong, string35charLong, string35charLong, string35charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error in case addressLine1 is blank', async () => {
      //Given
      const address = new Address('', string35charLong, string35charLong, string35charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(1);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.VALID_ADDRESS_LINE_1');
    });

    it('should throw error in case of exceeded max length', async () => {
      //Given
      const address = new Address(string36charLong, string36charLong, string36charLong, string36charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('city')).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
    });
    it('should throw error if address length OK, contains special chars', async () => {
      //Given
      const address = new Address(stringWithSpecialChar1, stringWithSpecialChar2
        , stringWithSpecialChar3, stringWithSpecialChar4, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('addressLine2')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('addressLine3')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('city')).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
  });
});
