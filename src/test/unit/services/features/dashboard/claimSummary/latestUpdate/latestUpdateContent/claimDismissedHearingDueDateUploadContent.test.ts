import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {
  getClaimDismissedHearingDueDateUploadContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/claimDismissedHearingDueDateUploadContent';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

describe('claimDismissedHearingDueDateUploadContent', () => {
  it('should build dismissed hearing due date content', () => {
    const claim = new Claim();
    claim.caseProgressionHearing = new CaseProgressionHearing([], null, new Date('2024-10-10'), '10:30');

    const hearingDate = HearingDateTimeFormatter.getHearingDateFormatted(claim.caseProgressionHearing.hearingDate, 'en');
    const hearingTime = HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(claim.caseProgressionHearing.hearingTimeHourMinute);
    const CASE_DISMISSED_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE';

    const expected = new LatestUpdateSectionBuilder()
      .addTitle(`${CASE_DISMISSED_CONTENT}.TITLE`)
      .addWarning(`${CASE_DISMISSED_CONTENT}.DEFENDANT_WARNING`, {hearingDate, hearingTime})
      .addParagraph(`${CASE_DISMISSED_CONTENT}.DEFENDANT_PARAGRAPH`)
      .build();

    expect(getClaimDismissedHearingDueDateUploadContent(claim, 'en')).toEqual(expected);
  });
});
