import {
  DateInputFields,
  DateInputFieldsWitnessSummary,
  ExpertSection,
  FileOnlySection,
  FileUpload,
  ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
  WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'common/form/models/genericForm';
import {plainToInstance} from 'class-transformer';

describe('UploadDocumentsUserForm models', () => {
  it('should construct UploadDocumentsUserForm with all section arrays', () => {
    const form = new UploadDocumentsUserForm(
      [new TypeOfDocumentSection('1', '1', '2020')],
      [new FileOnlySection()],
      [new WitnessSection('1', '1', '2020')],
      [new WitnessSummarySection('1', '1', '2020')],
      [new WitnessSection('1', '1', '2020')],
      [new ReferredToInTheStatementSection('1', '1', '2020')],
      [new ExpertSection('1', '1', '2020')],
      [new ExpertSection('1', '1', '2020')],
      [new ExpertSection('1', '1', '2020')],
      [new ExpertSection('1', '1', '2020')],
      [new FileOnlySection()],
      [new FileOnlySection()],
      [new FileOnlySection()],
      [new FileOnlySection()],
      [new TypeOfDocumentSection('1', '1', '2020')],
    );

    expect(form.documentsForDisclosure).toHaveLength(1);
    expect(form.disclosureList).toHaveLength(1);
    expect(form.witnessStatement).toHaveLength(1);
    expect(form.witnessSummary).toHaveLength(1);
    expect(form.noticeOfIntention).toHaveLength(1);
    expect(form.documentsReferred).toHaveLength(1);
    expect(form.expertReport).toHaveLength(1);
    expect(form.expertStatement).toHaveLength(1);
    expect(form.questionsForExperts).toHaveLength(1);
    expect(form.answersForExperts).toHaveLength(1);
    expect(form.trialCaseSummary).toHaveLength(1);
    expect(form.trialSkeletonArgument).toHaveLength(1);
    expect(form.trialAuthorities).toHaveLength(1);
    expect(form.trialCosts).toHaveLength(1);
    expect(form.trialDocumentary).toHaveLength(1);
  });

  it('should construct empty UploadDocumentsUserForm', () => {
    const form = new UploadDocumentsUserForm();
    expect(form.documentsForDisclosure).toBeUndefined();
    expect(form.trialDocumentary).toBeUndefined();
  });

  it('should construct DateInputFields and convert to a Date', () => {
    const fields = new DateInputFields('15', '6', '2020');
    expect(fields.dateDay).toBe('15');
    expect(fields.dateMonth).toBe('6');
    expect(fields.dateYear).toBe('2020');
    expect(fields.date).toBeInstanceOf(Date);
  });

  it('should leave DateInputFields empty when day/month/year not provided', () => {
    const fields = new DateInputFields();
    expect(fields.dateDay).toBeUndefined();
    expect(fields.date).toBeUndefined();
  });

  it('should construct DateInputFieldsWitnessSummary', () => {
    const fields = new DateInputFieldsWitnessSummary('1', '2', '2021');
    expect(fields.dateDay).toBe('1');
    expect(fields.date).toBeInstanceOf(Date);
  });

  it('should construct TypeOfDocumentSection with nested date fields', () => {
    const section = new TypeOfDocumentSection('10', '10', '2022');
    expect(section.dateInputFields).toBeInstanceOf(DateInputFields);
    expect(section.dateInputFields.dateYear).toBe('2022');
  });

  it('should construct WitnessSection and WitnessSummarySection', () => {
    const witness = new WitnessSection('1', '1', '2020');
    const summary = new WitnessSummarySection('2', '2', '2021');
    expect(witness.dateInputFields).toBeInstanceOf(DateInputFields);
    expect(summary.dateInputFields).toBeInstanceOf(DateInputFieldsWitnessSummary);
  });

  it('should construct ExpertSection and ReferredToInTheStatementSection', () => {
    const expert = new ExpertSection('3', '3', '2019');
    const referred = new ReferredToInTheStatementSection('4', '4', '2018');
    expect(expert.dateInputFields.dateYear).toBe('2019');
    expect(referred.dateInputFields.dateYear).toBe('2018');
  });

  it('should allow FileUpload and FileOnlySection instantiation', () => {
    const upload = new FileUpload();
    upload.fieldname = 'file';
    upload.originalname = 'doc.pdf';
    upload.mimetype = 'application/pdf';
    upload.size = 100;

    const section = new FileOnlySection();
    section.fileUpload = upload;
    expect(section.fileUpload.originalname).toBe('doc.pdf');
  });

  it('should validate TypeOfDocumentSection missing required fields', async () => {
    const section = new TypeOfDocumentSection();
    const form = new GenericForm(section);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
  });

  it('should validate WitnessSection missing witness name', async () => {
    const section = new WitnessSection('1', '1', '2020');
    const form = new GenericForm(section);
    await form.validate();
    expect(form.errorFor('witnessName')).toBe('ERRORS.VALID_ENTER_WITNESS_NAME');
  });

  it('should validate ExpertSection fields when provided empty', async () => {
    const section = new ExpertSection('1', '1', '2020');
    section.expertName = '';
    const form = new GenericForm(section);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
  });

  it('should validate FileOnlySection requiring a file when caseDocument absent', async () => {
    const section = new FileOnlySection();
    const form = new GenericForm(section);
    await form.validate();
    expect(form.errorFor('fileUpload')).toBe('ERRORS.VALID_CHOOSE_THE_FILE');
  });

  it('should validate FileOnlySection for null and empty caseDocument', async () => {
    for (const caseDocument of [null, '']) {
      const section = new FileOnlySection();
      section.caseDocument = caseDocument as never;
      const form = new GenericForm(section);
      await form.validate();
      expect(form.errorFor('fileUpload')).toBe('ERRORS.VALID_CHOOSE_THE_FILE');
    }
  });

  it('should skip FileOnlySection file validation when caseDocument exists', async () => {
    const section = new FileOnlySection();
    section.caseDocument = {documentName: 'existing.pdf'} as never;
    const form = new GenericForm(section);
    await form.validate();
    expect(form.errorFor('fileUpload')).toBeUndefined();
  });

  it('should transform FileOnlySection fileUpload via Type metadata', () => {
    const section = plainToInstance(FileOnlySection, {
      fileUpload: {originalname: 'only.pdf', mimetype: 'application/pdf', size: 12},
    });
    expect(section.fileUpload).toBeInstanceOf(FileUpload);
  });

  it('should validate DateInputFieldsWitnessSummary date constraints', async () => {
    const valid = new DateInputFieldsWitnessSummary('1', '1', '2020');
    const formValid = new GenericForm(valid);
    await formValid.validate();
    expect(formValid.errorFor('date')).toBeUndefined();

    const empty = new DateInputFieldsWitnessSummary();
    empty.dateDay = undefined;
    empty.dateMonth = undefined;
    empty.dateYear = undefined;
    const formEmpty = new GenericForm(empty);
    await formEmpty.validate();
    expect(formEmpty.hasErrors()).toBeFalsy();
  });

  it('should validate nested file upload fields on document sections', async () => {
    const typeSection = new TypeOfDocumentSection('1', '1', '2020');
    typeSection.typeOfDocument = 'Letter';
    const witness = new WitnessSection('1', '1', '2020');
    witness.witnessName = 'Alex';
    const expert = new ExpertSection('1', '1', '2020');
    expert.expertName = 'Dr Smith';
    const summary = new WitnessSummarySection('1', '1', '2020');
    summary.witnessName = 'Alex';

    for (const section of [typeSection, witness, expert, summary]) {
      const form = new GenericForm(section);
      await form.validate();
      expect(form.errorFor('fileUpload')).toBe('ERRORS.VALID_CHOOSE_THE_FILE');
    }
  });

  it('should transform nested sections via class-transformer Type metadata', () => {
    const fileUpload = {originalname: 'a.pdf', mimetype: 'application/pdf', size: 10};
    const instance = plainToInstance(UploadDocumentsUserForm, {
      documentsForDisclosure: [{typeOfDocument: 'Letter', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      disclosureList: [{fileUpload}],
      witnessStatement: [{witnessName: 'Sam', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      witnessSummary: [{witnessName: 'Sam', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      noticeOfIntention: [{witnessName: 'Sam', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      documentsReferred: [{witnessName: 'Sam', typeOfDocument: 'Note', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      expertReport: [{expertName: 'Dr', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      expertStatement: [{expertName: 'Dr', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      questionsForExperts: [{expertName: 'Dr', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      answersForExperts: [{expertName: 'Dr', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
      trialCaseSummary: [{fileUpload: {originalname: 'b.pdf'}}],
      trialSkeletonArgument: [{fileUpload: {originalname: 'c.pdf'}}],
      trialAuthorities: [{fileUpload: {originalname: 'd.pdf'}}],
      trialCosts: [{fileUpload: {originalname: 'e.pdf'}}],
      trialDocumentary: [{typeOfDocument: 'Doc', dateInputFields: {dateDay: '1', dateMonth: '1', dateYear: '2020'}, fileUpload}],
    });

    expect(instance.documentsForDisclosure?.[0]).toBeInstanceOf(TypeOfDocumentSection);
    expect(instance.documentsForDisclosure?.[0].fileUpload).toBeInstanceOf(FileUpload);
    expect(instance.disclosureList?.[0]).toBeInstanceOf(FileOnlySection);
    expect(instance.witnessStatement?.[0]).toBeInstanceOf(WitnessSection);
    expect(instance.witnessStatement?.[0].fileUpload).toBeInstanceOf(FileUpload);
    expect(instance.witnessSummary?.[0]).toBeInstanceOf(WitnessSummarySection);
    expect(instance.expertReport?.[0]).toBeInstanceOf(ExpertSection);
    expect(instance.expertReport?.[0].fileUpload).toBeInstanceOf(FileUpload);
    expect(instance.documentsReferred?.[0]).toBeInstanceOf(ReferredToInTheStatementSection);
  });

  it('should skip fileUpload validation when caseDocument already exists', async () => {
    for (const section of [
      new TypeOfDocumentSection('1', '1', '2020'),
      new WitnessSection('1', '1', '2020'),
      new ExpertSection('1', '1', '2020'),
    ]) {
      if (section instanceof TypeOfDocumentSection) {
        section.typeOfDocument = 'Letter';
      }
      if (section instanceof WitnessSection) {
        section.witnessName = 'Alex';
      }
      if (section instanceof ExpertSection) {
        section.expertName = 'Dr Smith';
      }
      section.caseDocument = {documentName: 'existing.pdf'} as never;
      const form = new GenericForm(section);
      await form.validate();
      expect(form.errorFor('fileUpload')).toBeUndefined();
    }
  });

  it('should validate fileUpload when caseDocument is null or empty string', async () => {
    for (const caseDocument of [null, '']) {
      const section = new TypeOfDocumentSection('1', '1', '2020');
      section.typeOfDocument = 'Letter';
      section.caseDocument = caseDocument as never;
      const form = new GenericForm(section);
      await form.validate();
      expect(form.errorFor('fileUpload')).toBe('ERRORS.VALID_CHOOSE_THE_FILE');
    }
  });
});
