import {
  CIVIL_SERVICE_CASES_URL,
  CIVIL_SERVICE_FEES_URL,
  CIVIL_SERVICE_DASHBOARD_URL,
  CIVIL_SERVICE_ASSIGNMENT_URL,
  CIVIL_SERVICE_AIRLINES_URL,
  CIVIL_SERVICE_CLAIM_AMOUNT_URL,
  CIVIL_SERVICE_HEARING_URL,
  CIVIL_SERVICE_FEES_RANGES,
  CIVIL_SERVICE_VALIDATE_PIN_URL,
  CIVIL_SERVICE_DOCUMENT_URL,
  CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_UPLOAD_DOCUMENT_URL,
  CIVIL_SERVICE_CLAIMANT,
  CIVIL_SERVICE_SUBMIT_EVENT,
  CIVIL_SERVICE_CALCULATE_DEADLINE,
  CIVIL_SERVICE_CLAIM_CALCULATE_INTEREST,
  CIVIL_SERVICE_COURT_LOCATIONS,
  ASSIGN_CLAIM_TO_DEFENDANT,
  CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE,
  CIVIL_SERVICE_USER_CASE_ROLE,
  CIVIL_SERVICE_COURT_DECISION,
  CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL,
  CIVIL_SERVICE_CHECK_DEFENDENT_LINKED_URL,
  CIVIL_SERVICE_FEES_PAYMENT_URL,
  CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL,
  CIVIL_SERVICE_DASHBOARD_TASKLIST_URL,
  CIVIL_SERVICE_NOTIFICATION_LIST_URL,
  CIVIL_SERVICE_GA_NOTIFICATION_LIST_URL,
  CIVIL_SERVICE_BASE_DASHBOARD_URL,
  CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL,
  CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL,
  CIVIL_SERVICE_UPDATE_TASK_STATUS_URL,
  CIVIL_SERVICE_GENERAL_APPLICATION_FEE_URL,
  CIVIL_SERVICE_CALCULATE_TOTAL_CLAIM_AMOUNT_URL,
} from '../../../../main/app/client/civilServiceUrls';

describe('civilServiceUrls', () => {
  it('should export base path constants', () => {
    expect(CIVIL_SERVICE_CASES_URL).toBe('/cases/');
    expect(CIVIL_SERVICE_FEES_URL).toBe('/fees');
    expect(CIVIL_SERVICE_DASHBOARD_URL).toBe('/dashboard');
    expect(CIVIL_SERVICE_ASSIGNMENT_URL).toBe('/assignment');
    expect(CIVIL_SERVICE_AIRLINES_URL).toBe('/airlines');
    expect(CIVIL_SERVICE_DOCUMENT_URL).toBe('/case/document/');
    expect(CIVIL_SERVICE_COURT_LOCATIONS).toBe('/locations/courtLocations');
    expect(CIVIL_SERVICE_BASE_DASHBOARD_URL).toBe('/dashboard');
  });

  it('should build fee-related urls from CIVIL_SERVICE_FEES_URL', () => {
    expect(CIVIL_SERVICE_CLAIM_AMOUNT_URL).toBe('/fees/claim');
    expect(CIVIL_SERVICE_HEARING_URL).toBe('/fees/hearing');
    expect(CIVIL_SERVICE_FEES_RANGES).toBe('/fees/ranges');
    expect(CIVIL_SERVICE_CLAIM_CALCULATE_INTEREST).toBe('/fees/claim/calculate-interest');
    expect(CIVIL_SERVICE_FEES_PAYMENT_URL).toBe('/fees/:feeType/case/:claimId/payment');
    expect(CIVIL_SERVICE_FEES_PAYMENT_STATUS_URL).toBe('/fees/:feeType/case/:claimId/payment/:paymentReference/status');
    expect(CIVIL_SERVICE_GENERAL_APPLICATION_FEE_URL).toBe('/fees/general-application');
    expect(CIVIL_SERVICE_CALCULATE_TOTAL_CLAIM_AMOUNT_URL).toBe('/fees/claim/total-amount');
  });

  it('should build assignment-related urls', () => {
    expect(CIVIL_SERVICE_VALIDATE_PIN_URL).toBe('/assignment/reference/:caseReference');
    expect(ASSIGN_CLAIM_TO_DEFENDANT).toBe('/assignment/case/:claimId/DEFENDANT');
    expect(CIVIL_SERVICE_VALIDATE_OCMC_PIN_URL).toBe('/assignment/reference/:caseReference/ocmc');
    expect(CIVIL_SERVICE_CHECK_DEFENDENT_LINKED_URL).toBe('/assignment/reference/:caseReference/defendant-link-status');
  });

  it('should build document urls', () => {
    expect(CIVIL_SERVICE_DOWNLOAD_DOCUMENT_URL).toBe('/case/document/downloadDocument/:documentId');
    expect(CIVIL_SERVICE_UPLOAD_DOCUMENT_URL).toBe('/case/document/generateAnyDoc');
  });

  it('should build case urls', () => {
    expect(CIVIL_SERVICE_CLAIMANT).toBe('/cases/claimant/');
    expect(CIVIL_SERVICE_SUBMIT_EVENT).toBe('/cases/:caseId/citizen/:submitterId/event');
    expect(CIVIL_SERVICE_CALCULATE_DEADLINE).toBe('/cases/response/deadline');
    expect(CIVIL_SERVICE_AGREED_RESPONSE_DEADLINE_DATE).toBe('/cases/response/agreeddeadline/:claimId');
    expect(CIVIL_SERVICE_USER_CASE_ROLE).toBe('/cases/:claimId/userCaseRoles');
    expect(CIVIL_SERVICE_COURT_DECISION).toBe('/cases/:claimId/courtDecision');
  });

  it('should build dashboard notification and task urls', () => {
    expect(CIVIL_SERVICE_DASHBOARD_TASKLIST_URL).toBe('/dashboard/taskList/:ccd-case-identifier/role/:role-type');
    expect(CIVIL_SERVICE_NOTIFICATION_LIST_URL).toBe('/dashboard/notifications/:ccd-case-identifier/role/:role-type');
    expect(CIVIL_SERVICE_GA_NOTIFICATION_LIST_URL).toBe('/dashboard/notifications/ids/:ccd-case-identifiers/role/:role-type');
    expect(CIVIL_SERVICE_CREATE_SCENARIO_DASHBOARD_URL).toBe('/dashboard/scenarios/:scenarioRef/:redisKey');
    expect(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL).toBe('/dashboard/notifications/:notificationId');
    expect(CIVIL_SERVICE_UPDATE_TASK_STATUS_URL).toBe('/dashboard/taskList/:taskItemId');
  });
});
