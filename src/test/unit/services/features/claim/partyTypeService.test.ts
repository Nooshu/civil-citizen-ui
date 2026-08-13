import {Response} from 'express';
import {ClaimantOrDefendant, PartyType} from 'common/models/partyType';
import {redirectToPage} from 'services/features/claim/partyTypeService';
import {
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
  DELAYED_FLIGHT_URL,
} from 'routes/urls';

describe('partyTypeService redirectToPage', () => {
  let res: Response;

  beforeEach(() => {
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    } as unknown as Response;
  });

  it.each([
    [PartyType.INDIVIDUAL, ClaimantOrDefendant.CLAIMANT, CLAIMANT_INDIVIDUAL_DETAILS_URL],
    [PartyType.INDIVIDUAL, ClaimantOrDefendant.DEFENDANT, CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL],
    [PartyType.SOLE_TRADER, ClaimantOrDefendant.CLAIMANT, CLAIMANT_SOLE_TRADER_DETAILS_URL],
    [PartyType.SOLE_TRADER, ClaimantOrDefendant.DEFENDANT, CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL],
    [PartyType.COMPANY, ClaimantOrDefendant.CLAIMANT, CLAIMANT_COMPANY_DETAILS_URL],
    [PartyType.COMPANY, ClaimantOrDefendant.DEFENDANT, DELAYED_FLIGHT_URL],
    [PartyType.ORGANISATION, ClaimantOrDefendant.CLAIMANT, CLAIMANT_ORGANISATION_DETAILS_URL],
    [PartyType.ORGANISATION, ClaimantOrDefendant.DEFENDANT, CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL],
  ])('should redirect %s %s to %s', (partyType, role, url) => {
    redirectToPage(partyType, res, role);
    expect(res.redirect).toHaveBeenCalledWith(url);
  });

  it('should render not-found for unknown party type', () => {
    redirectToPage('UNKNOWN' as PartyType, res, ClaimantOrDefendant.CLAIMANT);
    expect(res.render).toHaveBeenCalledWith('not-found');
  });
});
