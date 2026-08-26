import * as urls from '../../main/routes/urls';

/**
 * URLs that have a mock file but must still be ignored, with a reason.
 *
 * Redirect stubs (`Found. Redirecting to …`) are not citizen pages. Hash fragments
 * are not distinct GETs. Do not add a real GOV.UK page here because HTML_CodeSniffer
 * disagrees with macros — use `pa11y-options.ts`.
 */
export const A11Y_IGNORED_URL_EXCEPTIONS: {url: string; reason: string}[] = [
  {
    url: urls.DEFENDANT_SUMMARY_TAB_URL,
    reason: 'Hash fragment of the defendant dashboard, not a distinct GET',
  },
  {
    url: urls.DEFENDANT_DOCUMENTS_URL,
    reason: 'Hash fragment of the defendant dashboard, not a distinct GET',
  },
  {
    url: urls.ASSIGN_CLAIM_URL,
    reason: 'Mock is an Express redirect stub, not a citizen page',
  },
  {
    url: urls.CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
    reason: 'Mock is an Express redirect stub, not a citizen page',
  },
  {
    url: urls.FIRST_CONTACT_CLAIM_SUMMARY_URL,
    reason: 'Mock is an Express redirect stub, not a citizen page',
  },
];

export const A11Y_IGNORED_URLS_WITH_MOCKS: string[] = A11Y_IGNORED_URL_EXCEPTIONS.map((entry) => entry.url);

/**
 * Routes Pa11y must not visit.
 *
 * Ignore only:
 * - no citizen GET view (redirects, APIs, cancel/back, payment confirmation hops)
 * - external sites
 * - developer-only surfaces (UI Preview catalogue, testing support)
 * - hash fragments listed in {@link A11Y_IGNORED_URLS_WITH_MOCKS}
 * - routes that still have **no** matching HTML mock
 *
 * Do **not** ignore a citizen page because HTML_CodeSniffer or axe disagrees with
 * official GOV.UK Frontend macros. Put that scanner code in `pa11y-options.ts`.
 */
export const IGNORED_URLS = [

  // No render views in CUI
  urls.POSTCODE_LOOKUP_URL,
  urls.SIGN_IN_URL,
  urls.SIGN_OUT_URL,
  urls.CALLBACK_URL,
  urls.BASE_GENERAL_APPLICATION_URL,
  urls.BASE_GENERAL_APPLICATION_RESPONSE_URL,
  urls.CANCEL_URL,
  urls.BACK_URL,

  urls.APPLICATION_FEE_PAYMENT_CONFIRMATION_URL,
  urls.APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,

  // Case progression: no render views
  urls.BASE_CASE_PROGRESSION_URL,
  urls.CASE_DOCUMENT_DOWNLOAD_URL,
  urls.HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
  urls.CANCEL_TRIAL_ARRANGEMENTS,
  urls.HEARING_FEE_CANCEL_JOURNEY,
  urls.HEARING_FEE_PAYMENT_CONFIRMATION_URL,
  urls.HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  urls.REQUEST_FOR_RECONSIDERATION_CANCEL_URL,

  // No matching HTML mock (or not a citizen GET). Add a mock under
  // `src/test/utils/mocks/a11y/` to un-ignore — do not invent fixture HTML.
  urls.DASHBOARD_CLAIMANT_URL, // /dashboard/:id/claimantNewDesign — legacy mock is /claimant
  urls.DASHBOARD_NOTIFICATION_REDIRECT,
  urls.DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT,

  urls.CASE_TIMELINE_DOCUMENTS_URL,
  urls.CLAIM_CHECK_ANSWERS_URL,
  urls.CLAIM_INTEREST_TOTAL_URL,

  urls.DEFENDANT_SUMMARY_URL,
  urls.CITIZEN_CONTACT_THEM_URL,
  urls.MAKE_APPLICATION_TO_COURT,
  urls.HELP_WITH_FEES_ELIGIBILITY,
  urls.GENERIC_HELP_FEES_URL,
  urls.TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT,

  urls.MEDIATION_SERVICE_EXTERNAL,
  urls.CLAIM_FEE_URL,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
  urls.CLAIM_FEE_PAYMENT_CONFIRMATION_URL,
  urls.CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL,
  urls.PAY_CLAIM_FEE_UNSUCCESSFUL_URL,

  urls.VIEW_MEDIATION_DOCUMENTS,
  urls.VIEW_DEFENDANT_INFO,
  urls.VIEW_CLAIMANT_INFO,
  urls.VIEW_RESPONSE_TO_CLAIM,

  urls.GA_CHECK_YOUR_ANSWERS_COSC_URL,
  urls.GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  urls.GA_COSC_CONFIRM_URL,
  urls.GA_PAYMENT_SUCCESSFUL_COSC_URL,
  urls.GA_PAYMENT_UNSUCCESSFUL_COSC_URL,

  urls.TESTING_SUPPORT_URL,

  // Developer-only UI Preview catalogue: not part of the citizen service and has no
  // captured mock page, so the harness would serve an error page.
  urls.UI_PREVIEW_URL,

  ...A11Y_IGNORED_URLS_WITH_MOCKS,

  urls.QM_BASE, // no controller for the base
];
