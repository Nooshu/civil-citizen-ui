import {Claim} from 'models/claim';
import {
  cancelMediationDocumentUpload,
  getCancelYourUpload,
} from 'services/features/mediation/uploadDocuments/mediationCancelUploadService';

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteFieldDraftClaimFromStore: jest.fn(),
}));

import {deleteFieldDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

describe('mediationCancelUploadService', () => {
  it('should build cancel upload content', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    const content = getCancelYourUpload('123', claim);

    expect(content.some(s => s.data?.text === 'COMMON.MEDIATION')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.EVIDENCE_UPLOAD_CANCEL.ARE_YOU_SURE')).toBe(true);
  });

  it('should delete mediation upload documents from store', async () => {
    const claim = new Claim();
    await cancelMediationDocumentUpload('redis-key', claim, 'user-1');
    expect(deleteFieldDraftClaimFromStore).toHaveBeenCalledWith('redis-key', claim, 'mediationUploadDocuments', 'user-1');
  });
});
