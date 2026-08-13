import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {
  getViewDefendantsReponseTask,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/howDefendantRespondSectionTaks';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL} from 'routes/urls';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimId = '123';
const lang = 'en';

describe('howDefendantRespondSectionTaks', () => {
  it('should return incomplete task when defendant response not viewed', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();

    const task = getViewDefendantsReponseTask(claim, claimId, lang);
    expect(task.description).toEqual('CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE');
    expect(task.url).toContain(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL.replace(':id', claimId));
    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
  });

  it('should return complete task when defendant response viewed', () => {
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.defendantResponseViewed = true;

    const task = getViewDefendantsReponseTask(claim, claimId, lang);
    expect(task.status).toEqual(TaskStatus.COMPLETE);
  });
});
