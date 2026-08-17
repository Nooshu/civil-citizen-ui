import {addEvidence} from 'services/features/claim/checkAnswers/claimSection/addEvidence';
import {summarySection} from 'models/summaryList/summarySections';
import {claimWithClaimTimeLineAndEvents} from '../../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_EVIDENCE_URL} from 'routes/urls';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('addEvidence', () => {
  it('should not add rows when evidence is missing', () => {
    const claimSection = summarySection({title: 'title', summaryRows: []});
    addEvidence(new Claim(), claimSection, '1', 'en');
    expect(claimSection.summaryList.rows).toHaveLength(0);
  });

  it('should add evidence title and evidence items', () => {
    const claim = claimWithClaimTimeLineAndEvents();
    const claimSection = summarySection({title: 'title', summaryRows: []});
    addEvidence(claim, claimSection, '1', 'en');

    expect(claimSection.summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE');
    expect(claimSection.summaryList.rows[0].actions.items[0].href).toBe(CLAIM_EVIDENCE_URL);
    expect(claimSection.summaryList.rows.length).toBeGreaterThan(1);
    expect(claimSection.summaryList.rows[1].value.html).toBe('roof');
  });
});
