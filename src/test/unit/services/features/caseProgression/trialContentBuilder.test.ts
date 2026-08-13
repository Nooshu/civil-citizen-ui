import {
  buildTrialCaseSummarySection,
  buildTrialSkeletonSection,
  buildTrialLegalSection,
  buildTrialCostSection,
  buildTrialDocumentarySection,
} from 'services/features/caseProgression/trialContentBuilder';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const invalidDateErrors = {
  invalidDayError: undefined,
  invalidMonthError: undefined,
  invalidYearError: undefined,
  invalidDateError: undefined,
};

describe('trialContentBuilder', () => {
  it('should build case summary section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY', null, 'govuk-!-width-three-quarters')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'trialCaseSummary', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('trialCaseSummary', 0)
      .build();
    expect(buildTrialCaseSummarySection()).toEqual(expected);
  });

  it('should build skeleton section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON', null, 'govuk-!-width-three-quarters')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'trialSkeletonArgument', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('trialSkeletonArgument', 0)
      .build();
    expect(buildTrialSkeletonSection()).toEqual(expected);
  });

  it('should build legal section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL', null, 'govuk-!-width-three-quarters')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'trialAuthorities', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('trialAuthorities', 0)
      .build();
    expect(buildTrialLegalSection()).toEqual(expected);
  });

  it('should build costs section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS', null, 'govuk-!-width-three-quarters')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'trialCosts', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('trialCosts', 0)
      .build();
    expect(buildTrialCostSection()).toEqual(expected);
  });

  it('should build documentary section for small claims', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', 'trialDocumentary', 'typeOfDocument', null, 0, null)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'trialDocumentary', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'trialDocumentary', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('trialDocumentary', 0)
      .build();
    expect(buildTrialDocumentarySection(true)).toEqual(expected);
  });

  it('should build documentary section for fast track', () => {
    const result = buildTrialDocumentarySection(false);
    expect(result[0].data.text).toBe('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
  });
});
