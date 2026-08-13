import {GenericForm} from 'common/form/models/genericForm';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';

describe('ReportDetail', () => {
  describe('constructor and factories', () => {
    it('builds from name and date parts', () => {
      const detail = new ReportDetail('Dr Smith', '2023', '2', '10');

      expect(detail.expertName).toBe('Dr Smith');
      expect(detail.year).toBe(2023);
      expect(detail.month).toBe(2);
      expect(detail.day).toBe(10);
      expect(detail.reportDate).toBeInstanceOf(Date);
    });

    it('fromObject maps request-style fields', () => {
      const detail = ReportDetail.fromObject({
        expertName: 'Dr Jones',
        year: '2022',
        month: '11',
        day: '5',
      });

      expect(detail.expertName).toBe('Dr Jones');
      expect(detail.year).toBe(2022);
      expect(detail.month).toBe(11);
      expect(detail.day).toBe(5);
    });

    it('fromJson rebuilds from a stored reportDate', () => {
      const stored = {
        expertName: 'Dr Lee',
        reportDate: new Date('2021-07-20T00:00:00.000Z'),
      } as ReportDetail;

      const detail = ReportDetail.fromJson(stored);

      expect(detail.expertName).toBe('Dr Lee');
      expect(detail.year).toBe(2021);
      expect(detail.month).toBe(7);
      expect(detail.day).toBe(20);
    });
  });

  describe('emptiness helpers', () => {
    it('treats blank rows as empty', () => {
      const detail = new ReportDetail('', '', '', '');

      expect(detail.isEmpty()).toBe(true);
      expect(detail.isAtLeastOneFieldPopulated()).toBe(false);
      expect(detail.isDayAndMonthAndYearNotAvailable()).toBe(true);
    });

    it('treats name-only rows as populated with missing date parts', () => {
      const detail = new ReportDetail('Dr Smith', '', '', '');

      expect(detail.isEmpty()).toBe(false);
      expect(detail.isAtLeastOneFieldPopulated()).toBe(true);
      expect(detail.isDayAndMonthAndYearNotAvailable()).toBe(true);
    });

    it('treats values with zero length as empty', () => {
      const detail = new ReportDetail('', '', '', '');
      (detail as unknown as {expertName: unknown}).expertName = [];

      expect(detail.isEmpty()).toBe(true);
    });

    it('does not treat null-like values as zero-length empty', () => {
      const detail = new ReportDetail('Dr Smith', '2023', '1', '15');
      (detail as unknown as {reportDate: unknown}).reportDate = null;

      expect(detail.isEmpty()).toBe(false);
    });

    it('detects when day/month/year are present', () => {
      const detail = new ReportDetail('Dr Smith', '2023', '1', '15');

      expect(detail.isDayAndMonthAndYearNotAvailable()).toBe(false);
    });
  });

  describe('validation', () => {
    it('requires expert name when any field is populated', async () => {
      const detail = new ReportDetail('', '2023', '1', '15');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.errorFor('expertName')).toBe('ERRORS.EXPERT_NAME_REQUIRED');
    });

    it('requires a valid date when name is set but date parts are missing', async () => {
      const detail = new ReportDetail('Dr Smith', '', '', '');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.errorFor('reportDate')).toBeTruthy();
    });

    it('rejects invalid day/month/year ranges', async () => {
      const detail = new ReportDetail('Dr Smith', '99', '0', '0');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('year')).toBeTruthy();
    });

    it('rejects a date in the future', async () => {
      const detail = new ReportDetail('Dr Smith', '2099', '1', '1');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.errorFor('reportDate')).toBe('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
    });

    it('accepts a fully populated past report', async () => {
      const detail = new ReportDetail('Dr Smith', '2023', '1', '15');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.hasErrors()).toBe(false);
    });

    it('skips field validation for a completely empty row', async () => {
      const detail = new ReportDetail('', '', '', '');
      const form = new GenericForm(detail);

      await form.validate();

      expect(form.errorFor('expertName')).toBeUndefined();
      expect(form.errorFor('day')).toBeUndefined();
      expect(form.errorFor('month')).toBeUndefined();
      expect(form.errorFor('year')).toBeUndefined();
    });
  });
});
