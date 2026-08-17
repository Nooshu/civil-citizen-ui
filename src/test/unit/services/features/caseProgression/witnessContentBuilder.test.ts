import {
  buildWitnessStatement,
  buildWitnessSummary,
  buildNoticeOfIntention,
  buildDocumentsReferred,
} from 'services/features/caseProgression/witnessContentBuilder';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const invalidDateErrors = {
  invalidDayError: undefined,
  invalidMonthError: undefined,
  invalidYearError: undefined,
  invalidDateError: undefined,
};

describe('witnessContentBuilder', () => {
  it('should build witness statement section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', 'witnessStatement', 'witnessName', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'witnessStatement', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'witnessStatement', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('witnessStatement', 0)
      .build();

    expect(buildWitnessStatement()).toEqual(expected);
  });

  it('should build witness summary section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', 'witnessSummary', 'witnessName', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'witnessSummary', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'witnessSummary', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('witnessSummary', 0)
      .build();

    expect(buildWitnessSummary()).toEqual(expected);
  });

  it('should build notice of intention section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', 'noticeOfIntention', 'witnessName', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'noticeOfIntention', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'noticeOfIntention', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('noticeOfIntention', 0)
      .build();

    expect(buildNoticeOfIntention()).toEqual(expected);
  });

  it('should build documents referred section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', 'documentsReferred', 'witnessName', null, 0)
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', 'documentsReferred', 'typeOfDocument', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'documentsReferred', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'documentsReferred', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('documentsReferred', 0)
      .build();

    expect(buildDocumentsReferred()).toEqual(expected);
  });
});
