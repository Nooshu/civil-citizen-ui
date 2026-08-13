import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {SupportRequiredList, SupportRequired} from 'models/directionsQuestionnaire/supportRequired';
import {YesNo} from 'form/models/yesNo';
import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {addSupportRequiredList} from 'services/features/claimantResponse/checkAnswers/hearing/addSupportRequiredList';
import {CaseState} from 'form/models/claimDetails';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('claimantResponse addSupportRequiredList', () => {
  const claimId = '1234';
  const lng = 'en';

  it('uses claimant DQ when claimant intention is pending', () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
    claim.claimantResponse.directionQuestionnaire.hearing.supportRequiredList = new SupportRequiredList(
      YesNo.YES,
      [Object.assign(new SupportRequired(), {fullName: 'Alex', disabledAccess: {selected: true}})],
    );

    const section: SummarySection = summarySection({title: 'Hearing', summaryRows: []});
    addSupportRequiredList(claim, section, claimId, lng);

    expect(section.summaryList.rows.length).toBeGreaterThan(0);
    expect(section.summaryList.rows[0].value.html).toContain('COMMON.VARIATION_3.YES');
  });

  it('uses defendant DQ when claimant intention is not pending', () => {
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();
    claim.directionQuestionnaire.hearing.supportRequiredList = new SupportRequiredList(YesNo.NO, []);

    const section: SummarySection = summarySection({title: 'Hearing', summaryRows: []});
    addSupportRequiredList(claim, section, claimId, lng);

    expect(section.summaryList.rows).toHaveLength(1);
    expect(section.summaryList.rows[0].value.html).toContain('COMMON.VARIATION_3.NO');
  });
});
