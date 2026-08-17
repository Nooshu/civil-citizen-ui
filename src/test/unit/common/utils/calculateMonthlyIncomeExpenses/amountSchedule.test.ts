import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {AmountSchedule} from 'common/utils/calculateMonthlyIncomeExpenses/amountSchedule';

describe('AmountSchedule', () => {
  describe('static instances', () => {
    it('should define WEEK with correct monthly conversion', () => {
      expect(AmountSchedule.WEEK.name).toEqual(TransactionSchedule.WEEK);
      expect(AmountSchedule.WEEK.valueInMonth).toEqual(52 / 12);
    });

    it('should define TWO_WEEKS with correct monthly conversion', () => {
      expect(AmountSchedule.TWO_WEEKS.name).toEqual(TransactionSchedule.TWO_WEEKS);
      expect(AmountSchedule.TWO_WEEKS.valueInMonth).toEqual(52 / 12 / 2);
    });

    it('should define FOUR_WEEKS with correct monthly conversion', () => {
      expect(AmountSchedule.FOUR_WEEKS.name).toEqual(TransactionSchedule.FOUR_WEEKS);
      expect(AmountSchedule.FOUR_WEEKS.valueInMonth).toEqual(52 / 12 / 4);
    });

    it('should define MONTH with correct monthly conversion', () => {
      expect(AmountSchedule.MONTH.name).toEqual(TransactionSchedule.MONTH);
      expect(AmountSchedule.MONTH.valueInMonth).toEqual(1);
    });
  });

  describe('getAll', () => {
    it('should return all schedule instances in order', () => {
      expect(AmountSchedule.getAll()).toEqual([
        AmountSchedule.WEEK,
        AmountSchedule.TWO_WEEKS,
        AmountSchedule.FOUR_WEEKS,
        AmountSchedule.MONTH,
      ]);
    });
  });

  describe('getSchedule', () => {
    it.each([
      [TransactionSchedule.WEEK, AmountSchedule.WEEK],
      [TransactionSchedule.TWO_WEEKS, AmountSchedule.TWO_WEEKS],
      [TransactionSchedule.FOUR_WEEKS, AmountSchedule.FOUR_WEEKS],
      [TransactionSchedule.MONTH, AmountSchedule.MONTH],
    ])('should return schedule for %s', (name, expected) => {
      expect(AmountSchedule.getSchedule(name)).toEqual(expected);
    });

    it('should return undefined for unknown schedule name', () => {
      expect(AmountSchedule.getSchedule('UNKNOWN')).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('should create instance with name and valueInMonth', () => {
      const schedule = new AmountSchedule(TransactionSchedule.WEEK, 4.333);
      expect(schedule.name).toEqual(TransactionSchedule.WEEK);
      expect(schedule.valueInMonth).toEqual(4.333);
    });
  });
});
