import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getApplyHelpFeeSelectionContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION';

describe('applyHelpFeeSelectionContents', () => {
  it('should return expected page sections', () => {
    const claimId = '1234567890';
    const totalClaimAmount = 1000;
    const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${HELP_FEE_SELECTION}.LINK_BEFORE
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">${HELP_FEE_SELECTION}.LINK_TEXT</a>.
    </p>`;

    const expected = new PageSectionBuilder()
      .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
      .addMainTitle(`${HELP_FEE_SELECTION}.TITLE`)
      .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId: caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
      .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
      .addRawHtml(linkParagraph)
      .addParagraph('')
      .addParagraph(`${HELP_FEE_SELECTION}.PARAGRAPH`)
      .addTitle(`${HELP_FEE_SELECTION}.QUESTION_TITLE`)
      .build();

    expect(getApplyHelpFeeSelectionContents('en', claimId, totalClaimAmount)).toEqual(expected);
  });
});
