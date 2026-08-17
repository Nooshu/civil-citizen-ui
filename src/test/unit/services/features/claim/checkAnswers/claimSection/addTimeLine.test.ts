import {addTimeLine} from 'services/features/claim/checkAnswers/claimSection/addTimeLine';
import {summarySection} from 'models/summaryList/summarySections';
import {claimWithClaimTimeLineAndEvents} from '../../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_TIMELINE_URL} from 'routes/urls';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('addTimeLine', () => {
  it('should not add rows when timeline is missing', () => {
    const claimSection = summarySection({title: 'title', summaryRows: []});
    addTimeLine(new Claim(), claimSection, '1', 'en');
    expect(claimSection.summaryList.rows).toHaveLength(0);
  });

  it('should add timeline title and timeline rows', () => {
    const claim = claimWithClaimTimeLineAndEvents();
    const claimSection = summarySection({title: 'title', summaryRows: []});
    addTimeLine(claim, claimSection, '1', 'en');

    expect(claimSection.summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TIMELINE_CLAIM_TITLE');
    expect(claimSection.summaryList.rows[0].actions.items[0].href).toBe(CLAIM_TIMELINE_URL);
    expect(claimSection.summaryList.rows.length).toBeGreaterThan(1);
    expect(claimSection.summaryList.rows[1].value.text).toBe('contract');
  });
});
