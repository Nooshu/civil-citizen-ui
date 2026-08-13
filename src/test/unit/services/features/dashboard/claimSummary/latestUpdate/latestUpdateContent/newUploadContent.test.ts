import {Claim} from 'models/claim';
import {getNewUpload} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/newUploadContent';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';

describe('newUploadContent', () => {
  it('should build new upload latest update sections with documents link', () => {
    const claim = new Claim();
    claim.id = 'claim-42';

    const content = getNewUpload(claim);

    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.NEW_DOCUMENTS')).toBe(true);
    expect(content.some(s =>
      s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.VIEW_DOCUMENTS'
      && s.data?.href === DEFENDANT_DOCUMENTS_URL.replace(':id', 'claim-42'),
    )).toBe(true);
  });
});
