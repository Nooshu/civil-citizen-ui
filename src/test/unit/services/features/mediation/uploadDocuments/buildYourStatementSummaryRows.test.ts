import {getMediationSummarySection} from 'services/features/mediation/uploadDocuments/buildYourStatementSummaryRows';
import {UploadDocuments, TypeOfDocuments, TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getYourStatement, getReferredDocument} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('buildYourStatementSummaryRows', () => {
  it('should return empty sections when no documents selected', () => {
    const uploadedDocuments = new UploadDocuments([]);
    const result = getMediationSummarySection(uploadedDocuments, '1', 'en');
    expect(result.sections).toEqual([]);
  });

  it('should build summary rows for your statement', () => {
    const uploadedDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, getYourStatement()),
    ]);

    const result = getMediationSummarySection(uploadedDocuments, '1', 'en');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].summaryList.rows.length).toBeGreaterThan(0);
    expect(result.sections[0].summaryList.rows[0].key.text).toContain('YOUR_STATEMENT');
  });

  it('should build summary rows for documents referred and index when multiple', () => {
    const docs = getReferredDocument();
    docs.push(getReferredDocument()[0]);
    const uploadedDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, docs),
    ]);

    const result = getMediationSummarySection(uploadedDocuments, '1', 'en');
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].summaryList.rows).toHaveLength(2);
    expect(result.sections[0].summaryList.rows[0].key.text).toContain('1');
    expect(result.sections[0].summaryList.rows[1].key.text).toContain('2');
  });

  it('should include both statement and referred document rows', () => {
    const uploadedDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, getYourStatement()),
      new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, getReferredDocument()),
    ]);

    const result = getMediationSummarySection(uploadedDocuments, '1', 'en');
    expect(result.sections[0].summaryList.rows.length).toBeGreaterThanOrEqual(2);
  });
});
