import {
  getConfirmationPageSection,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {VIEW_ORDERS_AND_NOTICES_URL} from 'routes/urls';
import {Claim} from 'models/claim';

const TITLE = 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT';
const DOCUMENT = 'https://www.gov.uk/government/publications/form-n244-application-notice';

describe('trialArrangementsConfirmationContent', () => {
  const claim = new Claim();
  claim.id = 'claim-1';

  it('should return ready for trial content', () => {
    const expected = new FinaliseYourTrialSectionBuilder()
      .addMainTitle(TITLE)
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
        VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claim.id),
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
        DOCUMENT,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_THERE_ARE_ANY_CHANGES_TO_THE_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.AS_SOON_AS_POSSIBLE_AND_PAY',
        '',
        true)
      .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_PHONE')
      .build();

    expect(getConfirmationPageSection('claim-1', claim, true)).toEqual(expected);
  });

  it('should return not ready for trial content', () => {
    const expected = new FinaliseYourTrialSectionBuilder()
      .addMainTitle(TITLE)
      .addWarning('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TRIAL_OR_HEARING_WILL_GO_AHEAD_AS_PLANNED')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.MAKE_AN_APPLICATION',
        DOCUMENT,
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IF_YOU_WANT_THE_DATE_OF_THE_HEARING',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.TO_THE_COURT_AND_PAY',
        '',
        true)
      .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL')
      .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS',
        VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claim.id),
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS',
        'PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS')
      .build();

    expect(getConfirmationPageSection('claim-1', claim, false)).toEqual(expected);
  });
});
