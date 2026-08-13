import {CCDClaim} from 'models/civilClaimResponse';
import {TrialArrangements, TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
import {DocumentType} from 'models/document/documentType';
import {toCUITrialArrangements} from 'services/translation/convertToCUI/convertToCUITrialArrangements';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  CCDTrialArrangementsHearingRequirements,
  CCDTrialArrangementsOtherComments,
} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';

describe('toCUITrialArrangements', () => {
  it ('should convert CCDClaim to TrialArrangements for claimant', () => {
    //Given
    const isClaimant = true;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(true), getTrialReadyDocument(false)],
      trialReadyApplicant: YesNoUpperCamelCase.NO,
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.trialArrangementsDocument = getTrialReadyDocument(isClaimant);
    expectedOutput.isCaseReady = YesNo.NO;
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should convert CCDClaim to TrialArrangements for defendant', () => {
    //Given
    const isClaimant = false;
    const respondent1RevisedHearingRequirements: CCDTrialArrangementsHearingRequirements = {
      revisedHearingRequirements: YesNoUpperCamelCase.NO,
      revisedHearingComments: 'test',
    };
    const respondent1HearingOtherComments: CCDTrialArrangementsOtherComments = { hearingOtherComments: 'test' };
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(true), getTrialReadyDocument(false)],
      trialReadyRespondent1: YesNoUpperCamelCase.YES,
      respondent1RevisedHearingRequirements: respondent1RevisedHearingRequirements,
      respondent1HearingOtherComments: respondent1HearingOtherComments,
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.trialArrangementsDocument = getTrialReadyDocument(isClaimant);
    expectedOutput.isCaseReady = YesNo.YES;
    expectedOutput.otherTrialInformation = 'test';
    expectedOutput.hasAnythingChanged = new HasAnythingChangedForm(YesNo.NO, 'test');
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should return undefined if CCDClaim does not have trial ready document for claimant', () => {
    //Given
    const isClaimant = true;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(false)],
    };
    const expectedOutput: TrialArrangements = undefined;

    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should convert claimant revised hearing requirements and other comments', () => {
    const isClaimant = true;
    const ccdClaim: CCDClaim = {
      trialReadyApplicant: YesNoUpperCamelCase.YES,
      applicantRevisedHearingRequirements: {
        revisedHearingRequirements: YesNoUpperCamelCase.YES,
        revisedHearingComments: 'claimant changes',
      },
      applicantHearingOtherComments: {hearingOtherComments: 'claimant other'},
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.isCaseReady = YesNo.YES;
    expectedOutput.hasAnythingChanged = new HasAnythingChangedForm(YesNo.YES, 'claimant changes');
    expectedOutput.otherTrialInformation = 'claimant other';

    expect(toCUITrialArrangements(ccdClaim, isClaimant)).toEqual(expectedOutput);
  });

  it ('should convert claimant when only revised hearing comments are present', () => {
    const ccdClaim: CCDClaim = {
      applicantRevisedHearingRequirements: {
        revisedHearingComments: 'comments only',
      },
    };
    const actual = toCUITrialArrangements(ccdClaim, true);
    expect(actual?.hasAnythingChanged).toEqual(new HasAnythingChangedForm(undefined, 'comments only'));
  });

  it ('should convert defendant when only revised hearing requirements flag is present', () => {
    const ccdClaim: CCDClaim = {
      respondent1RevisedHearingRequirements: {
        revisedHearingRequirements: YesNoUpperCamelCase.YES,
      },
    };
    const actual = toCUITrialArrangements(ccdClaim, false);
    expect(actual?.hasAnythingChanged).toEqual(new HasAnythingChangedForm(YesNo.YES, undefined));
  });

  it ('should convert claimant documents owned by applicant solicitor', () => {
    const solicitorDoc = getTrialReadyDocument(true);
    solicitorDoc.value.ownedBy = CaseRole.APPLICANTSOLICITORONE;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [solicitorDoc],
    };
    const actual = toCUITrialArrangements(ccdClaim, true);
    expect(actual?.trialArrangementsDocument).toEqual(solicitorDoc);
  });

  it ('should wrap unbracketed ownedBy values when matching case role', () => {
    const defendantDoc = getTrialReadyDocument(false);
    defendantDoc.value.ownedBy = 'DEFENDANT' as CaseRole;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [defendantDoc],
      trialReadyRespondent1: YesNoUpperCamelCase.NO,
    };
    const actual = toCUITrialArrangements(ccdClaim, false);
    expect(actual?.trialArrangementsDocument).toEqual(defendantDoc);
    expect(actual?.isCaseReady).toBe(YesNo.NO);
  });

  it ('should return undefined when ccdClaim is missing', () => {
    expect(toCUITrialArrangements(undefined, true)).toBeUndefined();
  });
});

function getTrialReadyDocument(isClaimant: boolean): TrialArrangementsDocument {
  if (isClaimant) {
    const claimantTrialArrangementsDocument = new TrialArrangementsDocument();
    claimantTrialArrangementsDocument.id = '1234';
    claimantTrialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5',
        'document_filename': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5/binary',
      },
      'documentName': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
      ownedBy: CaseRole.CLAIMANT,
    };
    return claimantTrialArrangementsDocument;
  } else {
    const defendantTrialArrangementsDocument = new TrialArrangementsDocument();
    defendantTrialArrangementsDocument.id = '2345';
    defendantTrialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2',
        'document_filename': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2/binary',
      },
      'documentName': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
      ownedBy: CaseRole.DEFENDANT,
    };
    return defendantTrialArrangementsDocument;
  }
}
