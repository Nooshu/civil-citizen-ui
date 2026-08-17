import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {YesNo} from 'form/models/yesNo';
import {
  buildPartAdmitAlreadyPaidResponseContent,
  getTheirDatePaid,
  getTheirPaidMethod,
  getWhyTheyDisagree,
} from 'services/features/claimantResponse/defendantResponse/partAdmissionAlreadyPaidDefendantsResponseContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

describe('partAdmissionAlreadyPaidDefendantsResponseContent', () => {
  it('should build date paid section', () => {
    const result = getTheirDatePaid('1 January 2024', lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHEN_THEY_SAY_THEY_PAID');
    expect(result[1].data?.text).toEqual('1 January 2024');
  });

  it('should build why they disagree section', () => {
    const result = getWhyTheyDisagree('Amount wrong', lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHY_THEY_DISAGREE_AMOUNT');
    expect(result[1].data?.text).toEqual('Amount wrong');
  });

  it('should build paid method section', () => {
    const result = getTheirPaidMethod('Cash', lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.HOW_PAID');
    expect(result[1].data?.text).toEqual('Cash');
  });

  it('should build full part admit already paid content', () => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.alreadyPaid = {option: YesNo.YES};
    claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({
      amount: 150, date: new Date('2024-03-01'), day: '1', month: '3', year: '2024', text: 'Bank transfer',
    });
    claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree('Disagree amount');

    const result = buildPartAdmitAlreadyPaidResponseContent(claim, lang);
    expect(result[0].data?.text).toEqual('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_ALREADY_PAID_STATEMENT');
    expect(result.some(s => s.data?.text === 'Bank transfer')).toBe(true);
    expect(result.some(s => s.data?.text === 'Disagree amount')).toBe(true);
  });
});
