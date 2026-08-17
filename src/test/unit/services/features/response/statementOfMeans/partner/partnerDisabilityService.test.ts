import {PartnerDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerDisabilityService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {GenericForm} from 'form/models/genericForm';

jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');

const claimId = '123';
const partnerDisabilityService = new PartnerDisabilityService();

describe('PartnerDisabilityService', () => {
  describe('getPartnerDisability', () => {
    it('should return empty form when no data retrieved', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(new Claim());

      const result = await partnerDisabilityService.getPartnerDisability(claimId);

      expect(result.model.option).toBeUndefined();
    });

    it('should return populated form when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.partnerDisability = new GenericYesNo(YesNo.YES);
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);

      const result = await partnerDisabilityService.getPartnerDisability(claimId);

      expect(result.model.option).toEqual(YesNo.YES);
    });

    it('should rethrow error when store fails', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockRejectedValue(new Error('Redis failure'));

      await expect(partnerDisabilityService.getPartnerDisability(claimId)).rejects.toThrow('Redis failure');
    });
  });

  describe('savePartnerDisability', () => {
    it('should save when statementOfMeans exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await partnerDisabilityService.savePartnerDisability(claimId, new GenericForm(new GenericYesNo(YesNo.NO)));

      expect(spySave).toHaveBeenCalled();
      expect(claim.statementOfMeans.partnerDisability.option).toEqual(YesNo.NO);
    });

    it('should create statementOfMeans when missing', async () => {
      const claim = new Claim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await partnerDisabilityService.savePartnerDisability(claimId, new GenericForm(new GenericYesNo(YesNo.YES)));

      expect(spySave).toHaveBeenCalled();
      expect(claim.statementOfMeans.partnerDisability.option).toEqual(YesNo.YES);
    });

    it('should rethrow error when save fails', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockRejectedValue(new Error('Save failure'));

      await expect(partnerDisabilityService.savePartnerDisability(claimId, new GenericForm(new GenericYesNo(YesNo.YES))))
        .rejects.toThrow('Save failure');
    });
  });
});
