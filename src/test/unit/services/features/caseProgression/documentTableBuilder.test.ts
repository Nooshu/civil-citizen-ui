import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  getEvidenceUploadDocuments,
  orderDocumentNewestToOldest,
} from 'services/features/caseProgression/documentTableBuilder';
import {UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {EvidenceUploadDisclosure, EvidenceUploadExpert} from 'models/document/documentType';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

jest.mock('services/features/caseProgression/uploadedEvidenceFormatter', () => ({
  UploadedEvidenceFormatter: {
    getDocumentTypeName: jest.fn(() => 'Disclosure document'),
    getDocumentLink: jest.fn(() => '<a>doc</a>'),
  },
}));

describe('documentTableBuilder', () => {
  describe('orderDocumentNewestToOldest', () => {
    it('should sort documents by createdDatetime descending', () => {
      const older = {
        caseDocument: {createdDatetime: new Date('2023-01-01')},
      } as UploadDocumentTypes;
      const newer = {
        caseDocument: {createdDatetime: new Date('2024-01-01')},
      } as UploadDocumentTypes;

      expect(orderDocumentNewestToOldest([older, newer])).toEqual([newer, older]);
    });
  });

  describe('getEvidenceUploadDocuments', () => {
    it('should return summary paragraph and empty tables when no documents', () => {
      const claim = new Claim();
      claim.id = '1';
      claim.totalClaimAmount = 1000;
      claim.caseProgression = new CaseProgression();

      const result = getEvidenceUploadDocuments(claim, 'en');
      expect(result[0].data.text).toBe('PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY');
    });

    it('should include disclosure table rows when documents exist', () => {
      const claim = new Claim();
      claim.id = '1';
      claim.totalClaimAmount = 25000;
      Object.defineProperty(claim, 'isFastTrackClaim', {get: () => true});
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.claimantUploadDocuments = {
        disclosure: [
          {
            documentType: EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE,
            createdDateTimeFormatted: '01 Jan 2024',
            caseDocument: {
              createdDatetime: new Date('2024-01-01'),
              documentName: 'disc.pdf',
            },
          } as UploadDocumentTypes,
        ],
        witness: [],
        expert: [
          {
            documentType: EvidenceUploadExpert.STATEMENT,
            createdDateTimeFormatted: '02 Jan 2024',
            caseDocument: {
              createdDatetime: new Date('2024-01-02'),
              documentName: 'expert.pdf',
            },
          } as UploadDocumentTypes,
        ],
        trial: [],
      };

      const result = getEvidenceUploadDocuments(claim, 'en');
      expect(result.length).toBeGreaterThan(1);
      expect(JSON.stringify(result)).toContain('PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS');
      expect(JSON.stringify(result)).toContain('PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE');
    });
  });
});
