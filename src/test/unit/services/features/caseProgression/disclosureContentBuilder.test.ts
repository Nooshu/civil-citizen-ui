import {
  buildDisclosureDocumentSection,
  buildDisclosureListSection,
} from 'services/features/caseProgression/disclosureContentBuilder';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const invalidDateErrors = {
  invalidDayError: undefined,
  invalidMonthError: undefined,
  invalidYearError: undefined,
  invalidDateError: undefined,
};

describe('disclosureContentBuilder', () => {
  it('should build disclosure document section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', 'documentsForDisclosure', 'typeOfDocument', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsForDisclosure', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'documentsForDisclosure', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('documentsForDisclosure', 0)
      .build();

    expect(buildDisclosureDocumentSection()).toEqual(expected);
  });

  it('should build disclosure list section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST', {}, 'govuk-!-width-three-quarters')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'disclosureList', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('disclosureList', 0)
      .build();

    expect(buildDisclosureListSection()).toEqual(expected);
  });
});
