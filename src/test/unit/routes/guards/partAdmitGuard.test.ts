import {Request, Response, NextFunction} from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PartAdmitGuard} from 'routes/guards/partAdmitGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/routes/features/response/checkAnswersController');
jest.mock('../../../../main/services/features/common/taskListService');
jest.mock('../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const CLAIM_ID = '123';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_TASK_LIST_URL);

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = {params: {id: CLAIM_ID}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('PartAdmitGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when partial admission payment amount is greater than 0', async () => {
    const claim = new Claim();
    claim.partialAdmission = {
      alreadyPaid: {option: 'Yes'},
      howMuchDoYouOwe: new HowMuchDoYouOwe(100, 1000),
    };

    mockGetCaseData.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('should redirect when partial admission payment amount is 0', async () => {
    const claim = new Claim();
    claim.partialAdmission = {
      alreadyPaid: {option: 'No'},
      howMuchDoYouOwe: new HowMuchDoYouOwe(0, 1000),
    };

    mockGetCaseData.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect when partial admission payment amount does not exist', async () => {
    const claim = new Claim();
    claim.partialAdmission = {
      alreadyPaid: {option: 'No'},
      howMuchDoYouOwe: new HowMuchDoYouOwe(),
    };

    mockGetCaseData.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect when partial admission is missing', async () => {
    const claim = new Claim();

    mockGetCaseData.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(respondentIncompleteSubmissionUrl);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should call next with error when draft store throws', async () => {
    const error = new Error('redis failure');
    mockGetCaseData.mockRejectedValue(error);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(error);
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });
});
