import {refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {getCaseDataFromStore, saveDraftClaim, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {redisDataFlushForDJ} from 'routes/guards/redisDataFlushForDJGuard';

jest.mock('modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
  generateRedisKey: jest.fn(() => 'mockRedisKey'),
}));

jest.mock('modules/utilityService', () => ({
  refreshDraftStoreClaimFrom: jest.fn(),
}));

describe('redisDataFlushForDJ', () => {
  const mockReq: any = {
    params: {id: 'test-case-id'},
    body: {},
    session: {user: {id: 'test-user-id'}},
  };

  const mockRes: any = {};
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue('mockRedisKey');
  });

  it('should refresh and save the claim when refreshDataForDJ is true', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(generateRedisKey).toHaveBeenCalledWith(mockReq);
    expect(refreshDraftStoreClaimFrom).toHaveBeenCalledWith(mockReq, true);
    expect(saveDraftClaim).toHaveBeenCalledWith(
      'mockRedisKey',
      {id: 'test-case-id', refreshDataForDJ: false},
      false,
      'test-user-id',
    );
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should not refresh or save when refreshDataForDJ is false', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: false});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).not.toHaveBeenCalled();
    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should not refresh or save when refreshDataForDJ is undefined', async () => {
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(refreshDraftStoreClaimFrom).not.toHaveBeenCalled();
    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should save with undefined userId when session user is missing', async () => {
    const reqWithoutUser: any = {
      params: {id: 'test-case-id'},
      body: {},
      session: {},
    };
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});

    await redisDataFlushForDJ(reqWithoutUser, mockRes, mockNext);

    expect(saveDraftClaim).toHaveBeenCalledWith(
      'mockRedisKey',
      {id: 'test-case-id', refreshDataForDJ: false},
      false,
      undefined,
    );
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with error when getCaseDataFromStore fails', async () => {
    const mockError = new Error('Something went wrong');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(mockError);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(getCaseDataFromStore).toHaveBeenCalledWith('mockRedisKey');
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });

  it('should call next with error when refreshDraftStoreClaimFrom fails', async () => {
    const mockError = new Error('refresh failed');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockRejectedValue(mockError);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(saveDraftClaim).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });

  it('should call next with error when saveDraftClaim fails', async () => {
    const mockError = new Error('save failed');
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({refreshDataForDJ: true});
    (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue({id: 'test-case-id', refreshDataForDJ: true});
    (saveDraftClaim as jest.Mock).mockRejectedValue(mockError);

    await redisDataFlushForDJ(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
});
