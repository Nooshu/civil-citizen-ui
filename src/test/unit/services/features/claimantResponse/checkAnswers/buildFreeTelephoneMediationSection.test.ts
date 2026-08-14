import {buildFreeTelephoneMediationSection} from 'services/features/claimantResponse/checkAnswers/buildFreeTelephoneMediationSection';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {Mediation} from 'models/mediation/mediation';
import {CanWeUse} from 'models/mediation/canWeUse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {CompanyTelephoneNumber} from 'common/form/models/mediation/companyTelephoneNumber';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/partyPhone';

describe('buildFreeTelephoneMediationSection (claimant response)', () => {
  const claimId = '1234';

  function baseClaim(type: PartyType = PartyType.INDIVIDUAL): Claim {
    const claim = new Claim();
    claim.id = claimId;
    claim.applicant1 = Object.assign(new Party(), {
      type,
      partyDetails: Object.assign(new PartyDetails({}), {contactPerson: 'Primary Contact'}),
      partyPhone: new PartyPhone('07000000000'),
    });
    claim.claimantResponse = new ClaimantResponse();
    return claim;
  }

  it('should only list mediation choice when claimant disagrees with mediation', () => {
    const claim = baseClaim();
    claim.claimantResponse.mediation = new Mediation(
      undefined,
      new GenericYesNo(YesNo.NO),
    );

    const section = buildFreeTelephoneMediationSection(claim, claimId, 'en');
    expect(section.summaryList.rows).toHaveLength(1);
  });

  it('should include contact number when canWeUse is YES for an individual', () => {
    const claim = baseClaim(PartyType.INDIVIDUAL);
    const canWeUse: CanWeUse = {option: YesNo.YES, mediationPhoneNumber: '07123456789'};
    claim.claimantResponse.mediation = new Mediation(canWeUse);

    const section = buildFreeTelephoneMediationSection(claim, claimId, 'en');
    expect(section.summaryList.rows).toHaveLength(2);
    expect(section.summaryList.rows[1].value.html).toContain('07123456789');
  });

  it('should include contact name and number for company applicants', () => {
    const claim = baseClaim(PartyType.COMPANY);
    claim.claimantResponse.mediation = new Mediation(
      undefined,
      undefined,
      undefined,
      new CompanyTelephoneNumber(YesNo.NO, '07999888777', 'Company Contact', undefined),
    );

    const section = buildFreeTelephoneMediationSection(claim, claimId, 'en');
    expect(section.summaryList.rows).toHaveLength(3);
    expect(section.summaryList.rows[1].value.html).toContain('Company Contact');
    expect(section.summaryList.rows[2].value.html).toContain('07999888777');
  });

  it('should include contact name for organisation applicants when mediation agreed', () => {
    const claim = baseClaim(PartyType.ORGANISATION);
    const canWeUse: CanWeUse = {option: YesNo.YES, mediationPhoneNumber: '07111111111'};
    claim.claimantResponse.mediation = new Mediation(canWeUse);

    const section = buildFreeTelephoneMediationSection(claim, claimId, 'en');
    expect(section.summaryList.rows).toHaveLength(3);
  });
});
