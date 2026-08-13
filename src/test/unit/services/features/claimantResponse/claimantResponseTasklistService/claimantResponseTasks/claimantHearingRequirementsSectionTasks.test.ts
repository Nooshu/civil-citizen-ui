import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  getGiveUsDetailsClaimantHearingTask,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/claimantHearingRequirementsSectionTasks';
import {DETERMINATION_WITHOUT_HEARING_URL, DQ_TRIED_TO_SETTLE_CLAIM_URL} from 'routes/urls';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimId = '123';
const lang = 'en';

describe('claimantHearingRequirementsSectionTasks', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return incomplete small claims task with determination without hearing url', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 500;
    claim.claimantResponse = new ClaimantResponse();
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);

    const task = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, false);
    expect(task.description).toEqual('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS');
    expect(task.url).toContain(DETERMINATION_WITHOUT_HEARING_URL.replace(':id', claimId));
    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
  });

  it('should mark small claims task complete when DQ journey completed', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(true);
    jest.spyOn(DirectionQuestionnaire.prototype, 'isSmallClaimsDQJourneyCompleted', 'get').mockReturnValue(true);

    const task = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, false);
    expect(task.status).toEqual(TaskStatus.COMPLETE);
  });

  it('should use tried to settle url for fast track and mark complete', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(false);
    jest.spyOn(claim, 'isFastTrackClaim', 'get').mockReturnValue(true);
    jest.spyOn(DirectionQuestionnaire.prototype, 'isFastTrackDQJourneyCompleted', 'get').mockReturnValue(true);

    const task = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, false);
    expect(task.url).toContain(DQ_TRIED_TO_SETTLE_CLAIM_URL.replace(':id', claimId));
    expect(task.status).toEqual(TaskStatus.COMPLETE);
  });

  it('should mark intermediate/multi track complete when minti applicable', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 50000;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(false);
    jest.spyOn(claim, 'isFastTrackClaim', 'get').mockReturnValue(false);
    jest.spyOn(DirectionQuestionnaire.prototype, 'isIntermediateOrMultiTrackDQJourneyCompleted', 'get').mockReturnValue(true);

    const task = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, true);
    expect(task.status).toEqual(TaskStatus.COMPLETE);
  });

  it('should remain incomplete when no track matches', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 100;
    claim.claimantResponse = new ClaimantResponse();
    jest.spyOn(claim, 'isSmallClaimsTrackDQ', 'get').mockReturnValue(false);
    jest.spyOn(claim, 'isFastTrackClaim', 'get').mockReturnValue(false);

    const task = getGiveUsDetailsClaimantHearingTask(claim, claimId, lang, false);
    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
  });
});
