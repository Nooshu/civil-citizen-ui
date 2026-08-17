import {getJudgementContent} from 'services/features/caseProgression/judgement/judgementService';
import {Claim} from 'models/claim';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {
  DocumentType,
} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {toInteger} from 'lodash';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {CaseRole} from 'form/models/caseRoles';

const lang = 'en';
const createdBy= 'Jhon';
const claimId = '1234';
const fileName = 'Name of file';
const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

function makeJudgementDoc(documentType: DocumentType): FinalOrderDocumentCollection {
  return {
    id: 'Document test',
    value: {
      createdBy,
      documentLink: document,
      documentName: fileName,
      documentType,
      documentSize: toInteger(5),
      createdDatetime: new Date(),
    },
  };
}

describe('getJudgementContent', () =>{
  describe('getJudgementContent', () => {
    it('should show empty judgement summary when no matching documents exist', () => {
      const caseData = new Claim();
      caseData.id = claimId;
      caseData.caseRole = CaseRole.CLAIMANT;
      caseData.defaultJudgmentDocuments = [makeJudgementDoc(DocumentType.HEARING_FORM)];

      const actual = getJudgementContent(caseData.id, caseData, lang, DASHBOARD_CLAIMANT_URL.replace(':id', claimId));

      expect(actual[0].contentSections[0].type).toMatch(ClaimSummaryType.TITLE);
      expect(actual[0].contentSections[1].type).toMatch(ClaimSummaryType.SUMMARY);
      expect(actual[0].contentSections[1].data.rows).toHaveLength(0);
      expect(actual[1].contentSections[0].type).toMatch(ClaimSummaryType.BUTTON);
    });

    it('should include claimant judgement document from systemGeneratedCaseDocuments', () => {
      const caseData = new Claim();
      caseData.id = claimId;
      caseData.caseRole = CaseRole.CLAIMANT;
      caseData.systemGeneratedCaseDocuments = [makeJudgementDoc(DocumentType.JUDGMENT_BY_ADMISSION_CLAIMANT)];

      const actual = getJudgementContent(caseData.id, caseData, lang, DASHBOARD_CLAIMANT_URL.replace(':id', claimId));

      expect(actual[0].contentSections[1].data.rows).toHaveLength(1);
    });

    it('should include defendant judgement document from defaultJudgmentDocuments', () => {
      const caseData = new Claim();
      caseData.id = claimId;
      caseData.caseRole = CaseRole.DEFENDANT;
      caseData.defaultJudgmentDocuments = [makeJudgementDoc(DocumentType.JUDGMENT_BY_ADMISSION_DEFENDANT)];

      const actual = getJudgementContent(caseData.id, caseData, lang, DASHBOARD_CLAIMANT_URL.replace(':id', claimId));

      expect(actual[0].contentSections[1].data.rows).toHaveLength(1);
    });

    it('should ignore empty systemGeneratedCaseDocuments and fall back to defaultJudgmentDocuments', () => {
      const caseData = new Claim();
      caseData.id = claimId;
      caseData.caseRole = CaseRole.CLAIMANT;
      caseData.systemGeneratedCaseDocuments = [];
      caseData.defaultJudgmentDocuments = [makeJudgementDoc(DocumentType.DEFAULT_JUDGMENT_CLAIMANT1)];

      const actual = getJudgementContent(caseData.id, caseData, lang, DASHBOARD_CLAIMANT_URL.replace(':id', claimId));

      expect(actual[0].contentSections[1].data.rows).toHaveLength(1);
    });
  });
});
