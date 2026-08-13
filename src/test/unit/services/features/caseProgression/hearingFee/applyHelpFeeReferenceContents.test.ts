import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getApplyHelpFeeReferenceContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION';

describe('applyHelpFeeReferenceContents', () => {
  it('should return expected page sections', () => {
    const claimId = '1234567890';
    const totalClaimAmount = 1500;

    const expected = new PageSectionBuilder()
      .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
      .addMainTitle(`${HELP_FEE_SELECTION}.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PAGE_TITLE`)
      .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId: caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
      .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
      .addTitle('PAGES.APPLY_HELP_WITH_FEES.REFERENCE_NUMBER.QUESTION_TITLE')
      .build();

    expect(getApplyHelpFeeReferenceContents(claimId, totalClaimAmount)).toEqual(expected);
  });
});
