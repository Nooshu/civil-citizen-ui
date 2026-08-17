import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  toCUIBoolean,
  toCUIBooleanString,
  toCUIGenericYesNo,
  toCUIYesNo,
} from 'services/translation/convertToCUI/convertToCUIYesNo';

describe('convertToCUIYesNo', () => {
  describe('toCUIGenericYesNo', () => {
    it('should return undefined when value is falsy', () => {
      expect(toCUIGenericYesNo(undefined)).toBeUndefined();
      expect(toCUIGenericYesNo(null)).toBeUndefined();
    });

    it('should map YES and NO', () => {
      expect(toCUIGenericYesNo(YesNoUpperCamelCase.YES)).toEqual(new GenericYesNo(YesNo.YES));
      expect(toCUIGenericYesNo(YesNoUpperCamelCase.NO)).toEqual(new GenericYesNo(YesNo.NO));
    });
  });

  describe('toCUIYesNo', () => {
    it('should return undefined when value is falsy', () => {
      expect(toCUIYesNo(undefined)).toBeUndefined();
    });

    it('should map YES and NO', () => {
      expect(toCUIYesNo(YesNoUpperCamelCase.YES)).toBe(YesNo.YES);
      expect(toCUIYesNo(YesNoUpperCamelCase.NO)).toBe(YesNo.NO);
    });
  });

  describe('toCUIBoolean', () => {
    it('should return undefined when value is falsy', () => {
      expect(toCUIBoolean(undefined)).toBeUndefined();
    });

    it('should map YES to true and NO to false', () => {
      expect(toCUIBoolean(YesNoUpperCamelCase.YES)).toBe(true);
      expect(toCUIBoolean(YesNoUpperCamelCase.NO)).toBe(false);
    });
  });

  describe('toCUIBooleanString', () => {
    it('should return undefined when value is falsy', () => {
      expect(toCUIBooleanString(undefined)).toBeUndefined();
    });

    it('should map YES and NO to string booleans', () => {
      expect(toCUIBooleanString(YesNoUpperCamelCase.YES)).toBe('true');
      expect(toCUIBooleanString(YesNoUpperCamelCase.NO)).toBe('false');
    });
  });
});
