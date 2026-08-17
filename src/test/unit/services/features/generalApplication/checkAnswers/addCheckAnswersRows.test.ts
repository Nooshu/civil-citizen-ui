import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {OrderJudge} from 'models/generalApplication/orderJudge';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
  UnavailableDateType,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {
  CertificateOfSatisfactionOrCancellation,
} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {
  addAddAnotherApplicationRow,
  addApplicationTypeRow,
  addAskForCostsRow,
  addCoScDocumentUploadRow,
  addDocumentUploadRow,
  addFinalPaymentDateRows,
  addHasEvidenceOfDebtPaymentRow,
  addHearingArrangementsRows,
  addHearingContactDetailsRows,
  addHearingSupportRows,
  addInformOtherPartiesRow,
  addN245Row,
  addOrderJudgeRow,
  addOtherPartiesAgreedRow,
  addRequestingReasonRow,
  addUnavailableDatesRows,
  getEvidencePaymentOption,
} from 'services/features/generalApplication/checkAnswers/addCheckAnswersRows';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('addCheckAnswersRows', () => {
  const claimId = '1';
  let claim: Claim;
  let generalApplication: GeneralApplication;

  beforeEach(() => {
    claim = new Claim();
    generalApplication = new GeneralApplication();
    claim.generalApplication = generalApplication;
  });

  it('should return empty application type rows when index out of range', () => {
    expect(addApplicationTypeRow(claimId, claim, 0, 'en')).toEqual([]);
  });

  it('should add application type row', () => {
    generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.EXTEND_TIME)];
    const rows = addApplicationTypeRow(claimId, claim, 0, 'en');
    expect(rows).toHaveLength(1);
    expect(rows[0].key.text).toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
  });

  it('should add other parties agreed row', () => {
    generalApplication.agreementFromOtherParty = YesNo.YES;
    const rows = addOtherPartiesAgreedRow(claimId, claim, 'en');
    expect(rows[0].key.text).toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED');
    expect(rows[0].value.html).toBe('COMMON.VARIATION_5.YES');
  });

  it('should add inform other parties rows including reason when no', () => {
    generalApplication.informOtherParties = new InformOtherParties(YesNo.NO, 'privacy');
    const rows = addInformOtherPartiesRow(claimId, claim, 'en');
    expect(rows).toHaveLength(2);
    expect(rows[0].value.html).toBe('COMMON.VARIATION_2.NO');
    expect(rows[1].value.text).toBe('privacy');
  });

  it('should add ask for costs row', () => {
    generalApplication.applicationCosts = YesNo.NO;
    const rows = addAskForCostsRow(claimId, claim, 'en');
    expect(rows[0].key.text).toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ASK_FOR_COSTS');
  });

  it('should add order judge and requesting reason rows', () => {
    generalApplication.orderJudges = [new OrderJudge('order text')];
    generalApplication.requestingReasons = [new RequestingReason('reason text')];
    expect(addOrderJudgeRow(claimId, claim, 0, 'en')[0].value.text).toBe('order text');
    expect(addRequestingReasonRow(claimId, claim, 0, 'en')[0].value.text).toBe('reason text');
  });

  it('should add another application row when allowed', () => {
    generalApplication.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
      new ApplicationType(ApplicationTypeOption.STRIKE_OUT),
    ];
    const rows = addAddAnotherApplicationRow(claimId, claim, 'en');
    expect(rows[0].value.html).toBe('COMMON.VARIATION_2.YES');
  });

  it('should add document upload rows for yes and no', () => {
    generalApplication.wantToUploadDocuments = YesNo.NO;
    expect(addDocumentUploadRow(claimId, claim, 'en')[0].value.html).toBe('COMMON.VARIATION_2.NO');

    const upload = new UploadGAFiles();
    upload.caseDocument = {documentName: 'evidence.pdf'} as UploadGAFiles['caseDocument'];
    generalApplication.wantToUploadDocuments = YesNo.YES;
    generalApplication.uploadEvidenceForApplication = [upload];
    const yesRows = addDocumentUploadRow(claimId, claim, 'en');
    expect(yesRows[0].value.html).toContain('evidence.pdf');
  });

  it('should add hearing arrangements, contact and unavailable dates rows', () => {
    generalApplication.hearingArrangement = new HearingArrangement();
    generalApplication.hearingArrangement.option = HearingTypeOptions.TELEPHONE;
    generalApplication.hearingArrangement.reasonForPreferredHearingType = 'easier';
    generalApplication.hearingArrangement.courtLocation = 'London Court - ABC';
    generalApplication.hearingContactDetails = new HearingContactDetails('07123456789', 'a@b.com');
    generalApplication.hasUnavailableDatesHearing = YesNo.YES;
    generalApplication.unavailableDatesHearing = new UnavailableDatesGaHearing([
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, {year: '2024', month: '1', day: '1'}),
      new UnavailableDatePeriodGaHearing(UnavailableDateType.LONGER_PERIOD, {year: '2024', month: '2', day: '1'}, {year: '2024', month: '2', day: '5'}),
    ]);

    expect(addHearingArrangementsRows(claimId, claim, 'en')).toHaveLength(3);
    expect(addHearingContactDetailsRows(claimId, claim, 'en')).toHaveLength(2);
    const unavailable = addUnavailableDatesRows(claimId, claim, 'en');
    expect(unavailable.length).toBeGreaterThanOrEqual(2);
    expect(unavailable[1].value.html).toContain('<li>');
  });

  it('should add hearing support rows and fall back to NO', () => {
    generalApplication.hearingSupport = new HearingSupport([]);
    expect(addHearingSupportRows(claimId, claim, 'en')[0].value.html).toBe('COMMON.NO');

    generalApplication.hearingSupport = new HearingSupport([
      SupportType.STEP_FREE_ACCESS,
      SupportType.HEARING_LOOP,
      SupportType.SIGN_LANGUAGE_INTERPRETER,
      SupportType.LANGUAGE_INTERPRETER,
      SupportType.OTHER_SUPPORT,
    ]);
    generalApplication.hearingSupport.signLanguageInterpreter.content = 'BSL';
    generalApplication.hearingSupport.languageInterpreter.content = 'Welsh';
    generalApplication.hearingSupport.otherSupport.content = 'Other';
    const rows = addHearingSupportRows(claimId, claim, 'en');
    expect(rows[0].value.html).toContain('STEP_FREE_ACCESS');
    expect(rows[0].value.html).toContain('BSL');
  });

  it('should add CoSc final payment and evidence rows', () => {
    generalApplication.certificateOfSatisfactionOrCancellation = new CertificateOfSatisfactionOrCancellation();
    generalApplication.certificateOfSatisfactionOrCancellation.defendantFinalPaymentDate = new DefendantFinalPaymentDate('1', '2', '2024');
    expect(addFinalPaymentDateRows(claimId, claim, 'en')).toHaveLength(1);

    generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence =
      new DebtPaymentEvidence(debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL);
    expect(addHasEvidenceOfDebtPaymentRow(claimId, claim, 'en')[0].value.html)
      .toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL');

    const upload = new UploadGAFiles();
    upload.caseDocument = {documentName: 'cosc.pdf'} as UploadGAFiles['caseDocument'];
    generalApplication.uploadEvidenceForApplication = [upload];
    expect(addCoScDocumentUploadRow(claimId, claim, 'en')[0].value.html).toContain('cosc.pdf');

    generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence =
      new DebtPaymentEvidence(debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT, 'no docs');
    expect(addHasEvidenceOfDebtPaymentRow(claimId, claim, 'en')[0].value.html).toContain('no docs');
  });

  it('should add n245 row and map evidence payment options', () => {
    const upload = new UploadGAFiles();
    upload.caseDocument = {documentName: 'n245.pdf'} as UploadGAFiles['caseDocument'];
    generalApplication.uploadN245Form = upload;
    expect(addN245Row(claimId, claim, 'en')[0].value.html).toContain('n245.pdf');

    expect(getEvidencePaymentOption(debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL))
      .toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL');
    expect(getEvidencePaymentOption(debtPaymentOptions.MADE_FULL_PAYMENT_TO_COURT))
      .toBe('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.HAS_DEBT_BEEN_PAID_TO_COURT');
    expect(getEvidencePaymentOption('other')).toBeUndefined();
  });
});
