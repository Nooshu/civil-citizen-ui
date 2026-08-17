import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';

describe('PriorityDebts', () => {
  describe('constructor', () => {
    it('leaves fields undefined when no args are passed', () => {
      const debts = new PriorityDebts();

      expect(debts.mortgage).toBeUndefined();
      expect(debts.rent).toBeUndefined();
      expect(debts.councilTax).toBeUndefined();
    });

    it('assigns provided transaction fields', () => {
      const mortgage = Transaction.buildPopulatedForm('mortgage', '100', TransactionSchedule.MONTH);
      const debts = new PriorityDebts({mortgage});

      expect(debts.mortgage).toBe(mortgage);
      expect(debts.rent).toBeUndefined();
    });
  });

  describe('buildEmptyForm', () => {
    it('builds empty transactions for every priority debt type', () => {
      const debts = PriorityDebts.buildEmptyForm();

      expect(debts.mortgage).toBeInstanceOf(Transaction);
      expect(debts.rent).toBeInstanceOf(Transaction);
      expect(debts.councilTax).toBeInstanceOf(Transaction);
      expect(debts.gas).toBeInstanceOf(Transaction);
      expect(debts.electricity).toBeInstanceOf(Transaction);
      expect(debts.water).toBeInstanceOf(Transaction);
      expect(debts.maintenance).toBeInstanceOf(Transaction);
      expect(debts.mortgage.transactionSource.name).toBe(ExpenseType.MORTGAGE_DEBT);
      expect(debts.rent.transactionSource.name).toBe(ExpenseType.RENT_DEBT);
    });
  });

  describe('convertToScheduledAmount', () => {
    it('returns an empty list when no debts are present', () => {
      expect(PriorityDebts.convertToScheduledAmount(new PriorityDebts())).toEqual([]);
    });

    it('converts populated Transaction fields to scheduled amounts', () => {
      const debts = new PriorityDebts({
        mortgage: Transaction.buildPopulatedForm('mortgage', '200', TransactionSchedule.MONTH),
        rent: Transaction.buildPopulatedForm('rent', '100', TransactionSchedule.WEEK),
      });

      const scheduled = PriorityDebts.convertToScheduledAmount(debts);

      expect(scheduled).toHaveLength(2);
      expect(scheduled[0]).toEqual(expect.objectContaining({amount: expect.any(Number)}));
      expect(scheduled[1]).toEqual(expect.objectContaining({amount: expect.any(Number)}));
    });

    it('skips keys that are not Transaction instances', () => {
      const debts = new PriorityDebts({
        mortgage: Transaction.buildPopulatedForm('mortgage', '50', TransactionSchedule.MONTH),
      });
      (debts as unknown as Record<string, unknown>).notATransaction = {foo: 'bar'};

      const scheduled = PriorityDebts.convertToScheduledAmount(debts);

      expect(scheduled).toHaveLength(1);
    });
  });
});
