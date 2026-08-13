import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import nock from 'nock';
import config from 'config';
import {ResponseOptions} from 'form/models/responseDeadline';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppSession, UserDetails} from '../../../../../../main/common/models/AppRequest';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};
mockedAppRequest.session = <AppSession>{user: <UserDetails>{id: '1234'}};
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const claim = new Claim();
claim.applicant1 = {
  partyDetails: {
    partyName: 'Mr. James Bond',
  },
  type: PartyType.INDIVIDUAL,
};
claim.responseDeadline = {
  agreedResponseDeadline: new Date(),
  calculatedResponseDeadline: new Date(),
  option: ResponseOptions.ALREADY_AGREED,
};
const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Extend ResponseDeadline Service', () => {
  describe('getClaimWithExtendedResponseDeadline', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      nock.cleanAll();
      claim.responseDeadline = {
        agreedResponseDeadline: new Date('2050-06-01'),
        calculatedResponseDeadline: new Date(),
        option: ResponseOptions.ALREADY_AGREED,
      };
    });

    it('should calculate and save the extended deadline', async () => {
      const calculated = new Date('2050-07-01');
      nock(citizenBaseUrl)
        .post('/cases/response/deadline')
        .reply(200, calculated.toISOString());
      mockGetCaseDataFromStore.mockResolvedValue(claim);
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const result = await getClaimWithExtendedResponseDeadline(mockedAppRequest);

      expect(result.responseDeadline.calculatedResponseDeadline).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });

    it('should throw when agreed response deadline is missing', async () => {
      const claimWithoutDeadline = new Claim();
      claimWithoutDeadline.responseDeadline = {option: ResponseOptions.ALREADY_AGREED};
      mockGetCaseDataFromStore.mockResolvedValue(claimWithoutDeadline);

      await expect(getClaimWithExtendedResponseDeadline(mockedAppRequest))
        .rejects.toThrow('No extended response deadline found');
    });
  });

  describe('submitExtendedResponseDeadline', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      nock.cleanAll();
      claim.respondentSolicitor1AgreedDeadlineExtension = undefined;
      claim.responseDeadline = {
        agreedResponseDeadline: new Date(),
        calculatedResponseDeadline: new Date(),
        option: ResponseOptions.ALREADY_AGREED,
      };
    });

    it('should submit event when task is incomplete', async () => {
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/1234/event')
        .reply(200, {});
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await submitExtendedResponseDeadline(mockedAppRequest);
      if (!nock.isDone()) {
        nock.cleanAll();
      }
      expect(spy).toHaveBeenCalled();
    });

    it('should not submit event when task is complete', async () => {
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await submitExtendedResponseDeadline(mockedAppRequest);
      expect(spy).not.toHaveBeenCalled();
      spy.mockClear();
    });

    it('should rethrow exception when redis throws exception', async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await expect(submitExtendedResponseDeadline(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
