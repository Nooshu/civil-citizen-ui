import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {getEvidenceUpload} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';
import {DocumentType} from 'models/document/documentType';
import {UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';

describe('evidenceUploadContent', () => {
  const createClaim = (withHearingDate: boolean) => {
    const claim = new Claim();
    claim.id = 'claim-99';
    if (withHearingDate) {
      claim.caseProgressionHearing = new CaseProgressionHearing([], null, new Date('2024-09-01'), null);
    }
    claim.systemGeneratedCaseDocuments = [
      {
        value: {
          createdBy: 'Civil',
          documentLink: {
            document_url: 'http://dm/sdo',
            document_filename: 'sdo.pdf',
            document_binary_url: 'http://dm/sdo/binary',
          },
          documentName: 'sdo.pdf',
          documentType: DocumentType.SDO_ORDER,
        },
      },
    ] as Claim['systemGeneratedCaseDocuments'];
    Object.defineProperty(claim, 'bundleStitchingDeadline', {get: () => '1 August 2024'});
    return claim;
  };

  it('should include bundle deadline warning when hearing date exists', () => {
    const content = getEvidenceUpload(createClaim(true));
    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_DUE_BY')).toBe(true);
    expect(content.some(s => s.data?.href === UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', 'claim-99'))).toBe(true);
  });

  it('should omit bundle deadline warning when hearing date is missing', () => {
    const content = getEvidenceUpload(createClaim(false));
    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE')).toBe(true);
    expect(content.some(s => s.data?.text === 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_DUE_BY')).toBe(false);
  });
});
