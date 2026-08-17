import {writeWithTTL} from 'modules/draft-store/redisWriteHelper';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {saveDraftClaimToCache, draftClaim} from 'modules/draft-store/draftClaimCache';

jest.mock('modules/draft-store/redisWriteHelper', () => ({
  writeWithTTL: jest.fn(),
}));

describe('draftClaimCache', () => {
  const mockWriteWithTTL = writeWithTTL as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteWithTTL.mockResolvedValue(undefined);
    draftClaim.id = '';
    draftClaim.case_data = {};
  });

  it('should save draft claim with default case data', async () => {
    const userId = 'user-123';

    await saveDraftClaimToCache(userId);

    expect(mockWriteWithTTL).toHaveBeenCalledTimes(1);
    const [key, claimToSave, category, options] = mockWriteWithTTL.mock.calls[0];

    expect(key).toBe(userId);
    expect(category).toBe(TTLCategory.DRAFT_CLAIM);
    expect(options.creationDate).toBeInstanceOf(Date);
    expect(claimToSave.id).toBe(userId);
    expect(claimToSave.case_data.id).toBe(userId);
    expect(claimToSave.case_data.draftClaimCreatedAt).toEqual(expect.any(String));
    expect(claimToSave.case_data.totalClaimAmount).toBe(9000);
    expect(claimToSave.case_data.applicant1.partyPhone).toEqual({});
  });

  it('should use provided apiData when passed', async () => {
    const userId = 'user-456';
    const apiData: any = {
      applicant1: {partyPhone: {}},
      customField: 'custom',
    };

    await saveDraftClaimToCache(userId, apiData);

    const [, claimToSave] = mockWriteWithTTL.mock.calls[0];
    expect(claimToSave.case_data.customField).toBe('custom');
    expect(claimToSave.case_data.id).toBe(userId);
  });

  it('should set applicant1 party phone when isCarmEnabled is true', async () => {
    const userId = 'user-carm';
    const apiData: any = {
      applicant1: {partyPhone: {}},
    };

    await saveDraftClaimToCache(userId, apiData, true);

    const [, claimToSave] = mockWriteWithTTL.mock.calls[0];
    expect(claimToSave.case_data.applicant1.partyPhone).toEqual({phone: '07800000000'});
  });

  it('should not overwrite party phone when isCarmEnabled is false', async () => {
    const userId = 'user-no-carm';
    const apiData: any = {
      applicant1: {partyPhone: {}},
    };

    await saveDraftClaimToCache(userId, apiData, false);

    const [, claimToSave] = mockWriteWithTTL.mock.calls[0];
    expect(claimToSave.case_data.applicant1.partyPhone).toEqual({});
  });

  it('should propagate writeWithTTL errors', async () => {
    mockWriteWithTTL.mockRejectedValue(new Error('redis write failed'));

    await expect(saveDraftClaimToCache('user-err')).rejects.toThrow('redis write failed');
  });

  it('should export mutable draftClaim object', () => {
    expect(draftClaim).toEqual(expect.objectContaining({
      id: expect.any(String),
      case_data: expect.any(Object),
    }));
  });
});
