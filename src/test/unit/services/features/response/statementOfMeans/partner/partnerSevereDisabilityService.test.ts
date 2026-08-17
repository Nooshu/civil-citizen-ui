import {PartnerSevereDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {GenericForm} from 'form/models/genericForm';

jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');

const claimId = '123';
const partnerSevereDisabilityService = new PartnerSevereDisabilityService();

describe('PartnerSevereDisabilityService', () => {
  describe('getPartnerSevereDisability', () => {
    it('should return empty form when no data retrieved', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(new Claim());

      const result = await partnerSevereDisabilityService.getPartnerSevereDisability(claimId);

      expect(result.model.option).toBeUndefined();
    });

    it('should return populated form when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.partnerSevereDisability = new GenericYesNo(YesNo.YES);
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);

      const result = await partnerSevereDisabilityService.getPartnerSevereDisability(claimId);

      expect(result.model.option).toEqual(YesNo.YES);
    });

    it('should rethrow error when store fails', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockRejectedValue(new Error('Redis failure'));

      await expect(partnerSevereDisabilityService.getPartnerSevereDisability(claimId))
        .rejects.toThrow('Redis failure');
    });
  });

  describe('savePartnerSevereDisability', () => {
    it('should save when statementOfMeans exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await partnerSevereDisabilityService.savePartnerSevereDisability(
        claimId, new GenericForm(new GenericYesNo(YesNo.NO)),
      );

      expect(spySave).toHaveBeenCalled();
      expect(claim.statementOfMeans.partnerSevereDisability.option).toEqual(YesNo.NO);
    });

    it('should create statementOfMeans when missing', async () => {
      const claim = new Claim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await partnerSevereDisabilityService.savePartnerSevereDisability(
        claimId, new GenericForm(new GenericYesNo(YesNo.YES)),
      );

      expect(spySave).toHaveBeenCalled();
      expect(claim.statementOfMeans.partnerSevereDisability.option).toEqual(YesNo.YES);
    });

    it('should rethrow error when save fails', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockRejectedValue(new Error('Save failure'));

      await expect(partnerSevereDisabilityService.savePartnerSevereDisability(
        claimId, new GenericForm(new GenericYesNo(YesNo.YES)),
      )).rejects.toThrow('Save failure');
    });
  });
});
