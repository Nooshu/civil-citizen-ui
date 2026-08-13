import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from 'routes/urls';
import {
  getYouCanUseContent,
  getYouCanUseHWFEligible,
  getYouCanUseHWFEligibleReference,
} from 'services/features/eligibility/eligibleService';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('eligibleService', () => {
  describe('getYouCanUseContent', () => {
    it('should return HWF eligible content', () => {
      const result = getYouCanUseContent(`${ELIGIBILITY_HWF_ELIGIBLE_URL}?x=1`, 'en');
      expect(result).toEqual(getYouCanUseHWFEligible('en'));
    });

    it('should return HWF eligible reference content', () => {
      const result = getYouCanUseContent(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL, 'en');
      expect(result).toEqual(getYouCanUseHWFEligibleReference('en'));
    });

    it('should return empty array for eligible for this service url', () => {
      expect(getYouCanUseContent(ELIGIBLE_FOR_THIS_SERVICE_URL, 'en')).toEqual([]);
    });

    it('should return empty array for unknown url', () => {
      expect(getYouCanUseContent('/unknown', 'en')).toEqual([]);
    });
  });

  describe('getYouCanUseHWFEligible', () => {
    it('should return link section', () => {
      const result = getYouCanUseHWFEligible('en');
      expect(result[0].type).toBe(ClaimSummaryType.LINK);
      expect(result[0].data.href).toBe('https://www.gov.uk/get-help-with-court-fees');
      expect(result[0].data.textBefore).toBe('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.PAY_COURT');
      expect(result[0].data.text).toBe('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.HELP_WITH_FEES');
    });
  });

  describe('getYouCanUseHWFEligibleReference', () => {
    it('should return paragraph section', () => {
      const result = getYouCanUseHWFEligibleReference('cy');
      expect(result[0].type).toBe(ClaimSummaryType.PARAGRAPH);
      expect(result[0].data.text).toBe('PAGES.YOU_CAN_USE.HWF_ELIGIBLE_REFERENCE.REMEMBER');
    });
  });
});
