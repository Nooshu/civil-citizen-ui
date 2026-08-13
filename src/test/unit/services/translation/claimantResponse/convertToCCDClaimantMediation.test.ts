import {Mediation} from 'models/mediation/mediation';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {toCCDClaimantMediation} from 'services/translation/claimantResponse/convertToCCDClaimantMediation';

describe('toCCDClaimantMediation', () => {
  it('should return undefined when mediation is undefined', () => {
    expect(toCCDClaimantMediation(undefined)).toBeUndefined();
  });

  it('should map mediation including hasAgreedFreeMediation', () => {
    const mediation = new Mediation();
    mediation.canWeUse = {option: YesNo.YES, mediationPhoneNumber: '01234567890'};
    mediation.mediationDisagreement = new GenericYesNo(YesNo.NO);

    const result = toCCDClaimantMediation(mediation);

    expect(result).toBeDefined();
    expect(result.hasAgreedFreeMediation).toBeDefined();
    expect(result.canWeUseMediationLiP).toBe(YesNoUpperCamelCase.YES);
  });

  it('should map empty mediation object', () => {
    const result = toCCDClaimantMediation(new Mediation());
    expect(result).toBeDefined();
    expect(result.hasAgreedFreeMediation).toBeDefined();
  });
});
