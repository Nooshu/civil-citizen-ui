import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {HEARING_FEE_CANCEL_JOURNEY} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

describe('applyHelpFeeSelectionButtonContents', () => {
  it('should return continue button with cancel journey link', () => {
    const claimId = '1234567890';
    const expected = new PageSectionBuilder()
      .addButtonWithCancelLink(
        'COMMON.BUTTONS.CONTINUE',
        '',
        false,
        constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY),
      )
      .build();

    expect(getButtonsContents(claimId)).toEqual(expected);
  });
});
