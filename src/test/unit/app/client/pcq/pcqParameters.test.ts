import {EncryptedPcqParams, PcqParameters} from 'client/pcq/pcqParameters';

describe('pcqParameters', () => {
  it('should allow constructing required PcqParameters fields', () => {
    const params: PcqParameters = {
      pcqId: 'id-1',
      serviceId: 'civil-citizen-ui',
      actor: 'claimant',
      partyId: 'party@example.com',
      returnUrl: 'https://example.com/return',
    };

    expect(params).toEqual({
      pcqId: 'id-1',
      serviceId: 'civil-citizen-ui',
      actor: 'claimant',
      partyId: 'party@example.com',
      returnUrl: 'https://example.com/return',
    });
  });

  it('should allow optional ccdCaseId and language', () => {
    const params: PcqParameters = {
      pcqId: 'id-2',
      serviceId: 'civil-citizen-ui',
      actor: 'respondent',
      partyId: 'party@example.com',
      returnUrl: 'https://example.com/return',
      ccdCaseId: '1234567890123456',
      language: 'cy',
    };

    expect(params.ccdCaseId).toBe('1234567890123456');
    expect(params.language).toBe('cy');
  });

  it('should extend PcqParameters with token for EncryptedPcqParams', () => {
    const encrypted: EncryptedPcqParams = {
      pcqId: 'id-3',
      serviceId: 'civil-citizen-ui',
      actor: 'respondent',
      partyId: 'party@example.com',
      returnUrl: 'https://example.com/return',
      token: 'encrypted-token',
    };

    expect(encrypted.token).toBe('encrypted-token');
    expect(encrypted.pcqId).toBe('id-3');
  });
});
