import {
  buildExpertReportSection,
  buildJointStatementSection,
  buildQuestionsForOtherSection,
  buildAnswersToQuestionsSection,
} from 'services/features/caseProgression/expertContentBuilder';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const invalidDateErrors = {
  invalidDayError: undefined,
  invalidMonthError: undefined,
  invalidYearError: undefined,
  invalidDateError: undefined,
};

describe('expertContentBuilder', () => {
  it('should build expert report section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', 'expertReport', 'expertName', null, 0)
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', '', '', 'expertReport', 'fieldOfExpertise', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'expertReport', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'expertReport', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('expertReport', 0)
      .build();

    expect(buildExpertReportSection()).toEqual(expected);
  });

  it('should build joint statement section', () => {
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES', '', '', 'expertStatement', 'expertName', null, 0)
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', 'govuk-!-width-three-half', '', 'expertStatement', 'fieldOfExpertise', null, 0)
      .addDateArray('PAGES.UPLOAD_DOCUMENTS.DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'expertStatement', 'date', undefined, undefined, undefined, 0, 'dateInputFields')
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'expertStatement', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('expertStatement', 0)
      .build();

    expect(buildJointStatementSection()).toEqual(expected);
  });

  it('should build questions for other section with select items', () => {
    const selectItems = [{text: 'Party A', value: 'a'}];
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', 'questionsForExperts', 'expertName', null, 0)
      .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, 'questionsForExperts', 'otherPartyName', null, 0)
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '', '', 'questionsForExperts', 'questionDocumentName', null, 0)
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'questionsForExperts', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('questionsForExperts', 0)
      .build();

    expect(buildQuestionsForOtherSection(selectItems)).toEqual(expected);
  });

  it('should build answers to questions section with select items', () => {
    const selectItems = [{text: 'Party B', value: 'b'}];
    const expected = new UploadDocumentsSectionBuilder()
      .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS', null, 'govuk-!-width-three-quarters')
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', 'answersForExperts', 'expertName', null, 0)
      .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, 'answersForExperts', 'otherPartyName', null, 0)
      .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '', '', 'answersForExperts', 'otherPartyQuestionsDocumentName', null, 0)
      .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', 'answersForExperts', 'fileUpload', 0, undefined, undefined, undefined)
      .addRemoveSectionButton('answersForExperts', 0)
      .build();

    expect(buildAnswersToQuestionsSection(selectItems)).toEqual(expected);
  });
});
