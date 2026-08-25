import {
  getDocumentsForDocumentsReferred,
} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredService';
import {UploadDocuments, TypeOfDocuments, TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {GenericForm} from 'form/models/genericForm';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {getReferredDocument} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';

describe('documentsForDocumentsReferredService', () => {
  it('should return empty array when documents referred is not selected', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, false, []),
    ]);
    expect(getDocumentsForDocumentsReferred(uploadDocuments, undefined)).toEqual([]);
  });

  it('should return default section when form has no documents', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, []),
    ]);
    const form = new GenericForm(new UploadDocumentsForm());
    form.model.documentsForDocumentsReferred = [];

    const result = getDocumentsForDocumentsReferred(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0][0].contentSections.some(s =>
      s.data?.text === 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.DOCUMENTS_REFERRED_TO_IN_STATEMENT' ||
      s.data?.text === 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.TITLE.DOCUMENTS_REFERRED_TO_IN_THE_STATEMENT',
    ) || result[0][0].contentSections.length > 0).toBe(true);
  });

  it('should return a section per document when form is populated', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, []),
    ]);
    const formModel = new UploadDocumentsForm();
    formModel.documentsForDocumentsReferred = getReferredDocument() as UploadDocumentsForm['documentsForDocumentsReferred'];
    formModel.documentsForDocumentsReferred.push(getReferredDocument()[0] as UploadDocumentsForm['documentsForDocumentsReferred'][0]);
    const form = new GenericForm(formModel);

    const result = getDocumentsForDocumentsReferred(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  it('should return a default section when the form exists but referred arrays are missing', () => {
    const uploadDocuments = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, []),
    ]);
    const form = new GenericForm(new UploadDocumentsForm());

    const result = getDocumentsForDocumentsReferred(uploadDocuments, form);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
  });
});
