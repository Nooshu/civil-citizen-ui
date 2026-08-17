import {Claim} from 'models/claim';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {getRespondSettlementAgreementConfirmationContent} from 'services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService';
import {
  buildNextStepsSection,
  buildPanelSection,
} from 'services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder';

jest.mock('services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder', () => ({
  buildPanelSection: jest.fn(),
  buildNextStepsSection: jest.fn(),
}));

const buildPanelSectionMock = buildPanelSection as jest.Mock;
const buildNextStepsSectionMock = buildNextStepsSection as jest.Mock;

describe('respondSettlementAgreementConfirmationContentService', () => {
  const lang = 'en';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should flatten panel and next steps sections', () => {
    const claim = new Claim();
    const panel = [{type: ClaimSummaryType.PANEL, data: {title: 'panel'}}];
    const nextSteps = [
      {type: ClaimSummaryType.TITLE, data: {text: 'next-1'}},
      {type: ClaimSummaryType.PARAGRAPH, data: {text: 'next-2'}},
    ];
    buildPanelSectionMock.mockReturnValue(panel);
    buildNextStepsSectionMock.mockReturnValue(nextSteps);

    const result = getRespondSettlementAgreementConfirmationContent(claim, lang);

    expect(buildPanelSectionMock).toHaveBeenCalledWith(claim, lang);
    expect(buildNextStepsSectionMock).toHaveBeenCalledWith(claim, lang);
    expect(result).toEqual([...panel, ...nextSteps]);
  });

  it('should include undefined builder sections when flattening non-arrays', () => {
    const claim = new Claim();
    buildPanelSectionMock.mockReturnValue(undefined);
    buildNextStepsSectionMock.mockReturnValue(undefined);

    const result = getRespondSettlementAgreementConfirmationContent(claim, lang);

    expect(result).toEqual([undefined, undefined]);
  });
});
