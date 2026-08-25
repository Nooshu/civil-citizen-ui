import {getYourStatementContent} from 'services/features/mediation/uploadDocuments/yourStatementService';
import {UploadDocuments, TypeOfDocuments, TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {GenericForm} from 'form/models/genericForm';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {getYourStatement} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

describe('yourStatementService', () => {
  it('should return empty array when your statement is not selected', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, false, []),
    ]);
    expect(getYourStatementContent(uploadDocuments, undefined)).toEqual([]);
  });

  it('should return default section when form has no documents', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, []),
    ]);
    const form = new GenericForm(new UploadDocumentsForm());
    form.model.documentsForYourStatement = [];

    const result = getYourStatementContent(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].contentSections.some(s => s.data?.text === 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.YOUR_STATEMENT')).toBe(true);
  });

  it('should return a section per document when form is populated', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, []),
    ]);
    const formModel = new UploadDocumentsForm();
    formModel.documentsForYourStatement = [getYourStatement()[0]];
    const form = new GenericForm(formModel);

    const result = getYourStatementContent(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].contentSections.some(s => s.data?.text === 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.YOUR_STATEMENT')).toBe(true);
  });

  it('should return a default section when the form exists but statement arrays are missing', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, []),
    ]);
    const form = new GenericForm(new UploadDocumentsForm());

    const result = getYourStatementContent(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
  });
});
