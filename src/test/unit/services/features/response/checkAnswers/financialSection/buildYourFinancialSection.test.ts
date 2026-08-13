import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CitizenBankAccount} from 'models/citizenBankAccount';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {
  buildYourFinancialSection,
} from 'services/features/response/checkAnswers/financialSection/buildYourFinancialSection';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('buildYourFinancialSection', () => {
  it('should build financial section with title', () => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.bankAccounts = [new CitizenBankAccount('CURRENT_ACCOUNT', 'false', '100')];
    claim.statementOfMeans.disability = new GenericYesNo(YesNo.NO);

    const result = buildYourFinancialSection(claim, '123', 'en');
    expect(result.title).toEqual('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE');
    expect(result.summaryList.rows.length).toBeGreaterThan(0);
  });

  it('should still return a titled section when statement of means missing', () => {
    const claim = new Claim();
    const result = buildYourFinancialSection(claim, '123', 'en');
    expect(result.title).toEqual('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE');
    expect(result.summaryList).toBeDefined();
  });
});
