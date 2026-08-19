import {Claim} from 'models/claim';
import {
  getCoScGeneralApplicationConfirmationContent,
  getGeneralApplicationConfirmationContent,
  resolveGeneralApplicationFeePounds,
  resolveGeneralApplicationId,
} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(async () => '/dashboard/1'),
  isConfirmYouPaidCCJAppType: jest.fn(() => false),
}));

import {isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';

describe('submitGeneralApplicationConfirmationContent', () => {
  const claim = new Claim();

  it('should build standard confirmation content', async () => {
    (isConfirmYouPaidCCJAppType as jest.Mock).mockReturnValue(false);
    const content = await getGeneralApplicationConfirmationContent('1', 'ga-1', claim, 'en', 100);

    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON')).toBe(true);
    expect(content.some(s => s.data?.href?.includes('appFee=100'))).toBe(true);
    expect(content.some(s => s.data?.href?.includes('id=ga-1'))).toBe(true);
  });

  it('should build CoSc confirmation content via main method when CoSc app type', async () => {
    (isConfirmYouPaidCCJAppType as jest.Mock).mockReturnValue(true);
    const content = await getGeneralApplicationConfirmationContent('1', undefined, claim, 'en', 50);

    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED')).toBe(true);
  });

  it('should build dedicated CoSc confirmation content', async () => {
    const content = await getCoScGeneralApplicationConfirmationContent('1', 'ga-2', claim, 'en', 75);
    expect(content.some(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')).toBe(true);
    expect(content.some(s => s.data?.href?.includes('id=ga-2'))).toBe(true);
    expect(content.some(s => s.data?.href?.includes('appFee=75'))).toBe(true);
  });

  it('should not put NaN on the COSC confirmation pay URL or copy', async () => {
    const content = await getCoScGeneralApplicationConfirmationContent('1', 'ga-2', new Claim(), 'en', Number.NaN);
    expect(content.some(s => String(s.data?.href).includes('appFee=NaN'))).toBe(false);
    const saveParagraph = content.find(s => s.data?.text === 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE');
    expect(saveParagraph?.data?.variables?.applicationFee).toBe('');
  });
});

describe('resolveGeneralApplicationFeePounds', () => {
  it('should prefer a finite query fee in pounds', () => {
    const claim = new Claim();
    expect(resolveGeneralApplicationFeePounds('108', claim)).toBe(108);
  });

  it('should convert draft pence when the query is missing', () => {
    const claim = new Claim();
    claim.generalApplication = {applicationFee: {calculatedAmountInPence: '10800'}} as Claim['generalApplication'];
    expect(resolveGeneralApplicationFeePounds(undefined, claim)).toBe(108);
  });

  it('should convert draft pence when the query is an empty string', () => {
    const claim = new Claim();
    claim.generalApplication = {applicationFee: {calculatedAmountInPence: '10800'}} as Claim['generalApplication'];
    expect(resolveGeneralApplicationFeePounds('', claim)).toBe(108);
  });

  it('should not return NaN when both query and draft fee are missing', () => {
    expect(resolveGeneralApplicationFeePounds(undefined, new Claim())).toBeUndefined();
  });
});

describe('resolveGeneralApplicationId', () => {
  it('should prefer the query id', () => {
    expect(resolveGeneralApplicationId('ga-9', new Claim())).toBe('ga-9');
  });

  it('should use the first linked GA case on the claim', () => {
    const claim = new Claim();
    claim.generalApplications = [{
      value: {caseLink: {CaseReference: '1732194111758649'}},
    }] as Claim['generalApplications'];
    expect(resolveGeneralApplicationId(undefined, claim)).toBe('1732194111758649');
  });
});
