import {
  addDaysFilter,
  addDaysFilterTranslated,
  dateFilter,
  formatDate,
} from '../../../../../main/modules/nunjucks/filters/dateFilter';
import {t} from 'i18next';
import {DateTime} from 'luxon';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Add the days to current date to get the expected result', () => {
  it('should format an ISO date in long UK format', () => {
    expect(dateFilter('2024-05-29')).toBe('29 May 2024');
  });

  it('should format dd-MM-yyyy input and return blank for missing values', () => {
    expect(formatDate('29-05-2024')).toBe('29 May 2024');
    expect(formatDate('')).toBe('');
    expect(formatDate(undefined as unknown as string)).toBe('');
  });

  it('should add days to an ISO date', () => {
    expect(addDaysFilter('2024-05-29', 2).toISODate()).toBe('2024-05-31');
  });

  it('should add the day(s) successfully to the current date', () => {
    //Given
    const days = -1;
    const expectedResult = DateTime.now().day + days;

    //When
    const result = addDaysFilterTranslated('now',  days, t);

    //Then
    expect(result).not.toBeNull();
    expect(result).toContain(expectedResult.toString());
  });

  it('should add the day(s) successfully to the provided date', () => {
    //Given
    const referenceDate = new Date('2004-11-28T17:33:46.763Z');
    const days = 5;
    //When
    const result = addDaysFilterTranslated(referenceDate.toJSON(), days, t);
    //Then
    expect(result).not.toBeNull();
    expect(result).toContain('3 COMMON.MONTH_NAMES.DECEMBER 2004');
  });

  it('should return numeric GB format when requested', () => {
    expect(addDaysFilterTranslated('2004-11-28', 5, t, 'GB')).toBe('3/12/2004');
  });
});
