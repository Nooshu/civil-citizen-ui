import {
  ACCESSIBILITY_STATEMENT_URL,
  APPLICATION_TYPE_URL,
  CLAIM_AMOUNT_URL,
  CLAIM_DETAILS_URL,
  CITIZEN_CONTACT_THEM_URL,
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  COOKIES_URL,
  DASHBOARD_URL,
  DEFENDANT_SUMMARY_URL,
  DOB_URL,
  ELIGIBILITY_CLAIM_VALUE_URL,
  ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
  FIRST_CONTACT_SIGNPOSTING_URL,
  HOME_URL,
  MAKE_CLAIM,
  PRIVACY_POLICY_URL,
  RESPONSE_TASK_LIST_URL,
  TERMS_AND_CONDITIONS_URL,
  TESTING_SUPPORT_URL,
  CONTACT_US_URL,
  CLAIMANT_TASK_LIST_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';

export type PreviewPageStatus = 'ready' | 'stub';

export type PreviewPageLink = {
  title: string;
  path: string;
  status: PreviewPageStatus;
  notes?: string;
};

export type PreviewPageGroup = {
  title: string;
  description: string;
  pages: PreviewPageLink[];
};

/**
 * Fixture claim IDs seeded in e2e Redis (`uiPreviewRedisData.json`) and WireMock
 * (`compose/ui-preview-mappings/`) for UI Preview.
 */
export const UI_PREVIEW_FIXTURE_CLAIM_ID = '1645882162449409';
export const UI_PREVIEW_FULL_ADMIT_CLAIM_ID = '1645882162449601';
export const UI_PREVIEW_PART_ADMIT_CLAIM_ID = '1645882162449602';
export const UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID = '1645882162449603';
export const UI_PREVIEW_GA_CLAIM_ID = '1645882162449604';
export const UI_PREVIEW_FIXTURE_USER_ID = 'someID';

const withClaimId = (template: string, claimId: string): string =>
  template.replace(':id', claimId);

/**
 * Curated catalogue of previewable journeys for /ui-preview.
 * Ready = fixture/WireMock wired for a useful render; Stub = linked but may error until more mocks land.
 */
export const getUiPreviewPageCatalog = (): PreviewPageGroup[] => [
  {
    title: 'Public pages',
    description: 'No claim context required. Safe starting points for layout and GOV.UK styling checks.',
    pages: [
      {title: 'Home', path: HOME_URL, status: 'ready'},
      {title: 'Privacy policy', path: PRIVACY_POLICY_URL, status: 'ready'},
      {title: 'Cookies', path: COOKIES_URL, status: 'ready'},
      {title: 'Accessibility statement', path: ACCESSIBILITY_STATEMENT_URL, status: 'ready'},
      {title: 'Terms and conditions', path: TERMS_AND_CONDITIONS_URL, status: 'ready'},
      {title: 'Contact us', path: CONTACT_US_URL, status: 'ready'},
      {title: 'Make a claim (start)', path: MAKE_CLAIM, status: 'ready'},
    ],
  },
  {
    title: 'Eligibility',
    description: 'Claim eligibility flow (cookie-based; no civil-service required for early screens).',
    pages: [
      {title: 'Known claim amount', path: ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL, status: 'ready'},
      {title: 'Claim value', path: ELIGIBILITY_CLAIM_VALUE_URL, status: 'ready'},
      {title: 'Single defendant', path: ELIGIBILITY_SINGLE_DEFENDANT_URL, status: 'ready'},
    ],
  },
  {
    title: 'First contact',
    description: 'Defendant first-contact entry screens.',
    pages: [
      {title: 'First contact start', path: FIRST_CONTACT_SIGNPOSTING_URL, status: 'ready'},
      {title: 'Claim reference', path: FIRST_CONTACT_CLAIM_REFERENCE_URL, status: 'ready'},
    ],
  },
  {
    title: 'Claim issue',
    description: 'Create a draft claim via testing support, then continue the issue journey. Redis already has a draft for the fixture user.',
    pages: [
      {
        title: 'Create draft claim (testing support)',
        path: TESTING_SUPPORT_URL,
        status: 'ready',
        notes: 'Uses WireMock fees/events. Preferred way to start a claim in preview.',
      },
      {
        title: 'Claim amount',
        path: CLAIM_AMOUNT_URL,
        status: 'ready',
        notes: `Draft for user ${UI_PREVIEW_FIXTURE_USER_ID} is seeded in e2e Redis.`,
      },
      {
        title: 'Claimant task list',
        path: CLAIMANT_TASK_LIST_URL,
        status: 'ready',
        notes: 'Renders from the seeded draft; create-draft-claim can replace it.',
      },
    ],
  },
  {
    title: 'Dashboard & response (awaiting defendant)',
    description: `Fixture claim ${UI_PREVIEW_FIXTURE_CLAIM_ID} (user ${UI_PREVIEW_FIXTURE_USER_ID}) — AWAITING_RESPONDENT_ACKNOWLEDGEMENT, defendant role.`,
    pages: [
      {title: 'Dashboard', path: DASHBOARD_URL, status: 'ready'},
      {
        title: 'Defendant claim summary',
        path: withClaimId(DEFENDANT_SUMMARY_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
        notes: `WireMock GET /cases/${UI_PREVIEW_FIXTURE_CLAIM_ID}`,
      },
      {
        title: 'Contact them',
        path: withClaimId(CITIZEN_CONTACT_THEM_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Response task list',
        path: withClaimId(RESPONSE_TASK_LIST_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Claim details (response)',
        path: withClaimId(CLAIM_DETAILS_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Your details',
        path: withClaimId(CITIZEN_DETAILS_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Your date of birth',
        path: withClaimId(DOB_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Your phone',
        path: withClaimId(CITIZEN_PHONE_NUMBER_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'Response type',
        path: withClaimId(CITIZEN_RESPONSE_TYPE_URL, UI_PREVIEW_FIXTURE_CLAIM_ID),
        status: 'ready',
      },
    ],
  },
  {
    title: 'Full admission (claimant response)',
    description: `Fixture claim ${UI_PREVIEW_FULL_ADMIT_CLAIM_ID} — defendant admitted the full amount and offered £100 a month; claimant role.`,
    pages: [
      {
        title: 'Claimant response task list',
        path: withClaimId(CLAIMANT_RESPONSE_TASK_LIST_URL, UI_PREVIEW_FULL_ADMIT_CLAIM_ID),
        status: 'ready',
        notes: 'AWAITING_APPLICANT_INTENTION + FULL_ADMISSION + INSTALMENTS',
      },
      {
        title: 'Review defendant\'s response',
        path: withClaimId(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, UI_PREVIEW_FULL_ADMIT_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'How they want to pay',
        path: withClaimId(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, UI_PREVIEW_FULL_ADMIT_CLAIM_ID),
        status: 'ready',
        notes: 'Needs repaymentPlan on the Redis seed (amount, frequency, firstRepaymentDate).',
      },
    ],
  },
  {
    title: 'Part admission (claimant response)',
    description: `Fixture claim ${UI_PREVIEW_PART_ADMIT_CLAIM_ID} — defendant admits £400 of £1,000, not already paid, £100 a month; claimant role.`,
    pages: [
      {
        title: 'Claimant response task list',
        path: withClaimId(CLAIMANT_RESPONSE_TASK_LIST_URL, UI_PREVIEW_PART_ADMIT_CLAIM_ID),
        status: 'ready',
        notes: 'AWAITING_APPLICANT_INTENTION + PART_ADMISSION + INSTALMENTS',
      },
      {
        title: 'Review defendant\'s response',
        path: withClaimId(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, UI_PREVIEW_PART_ADMIT_CLAIM_ID),
        status: 'ready',
      },
      {
        title: 'How they want to pay',
        path: withClaimId(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, UI_PREVIEW_PART_ADMIT_CLAIM_ID),
        status: 'ready',
        notes: 'Needs repaymentPlan on the Redis seed (amount, frequency, firstRepaymentDate).',
      },
    ],
  },
  {
    title: 'Case progression',
    description: `Fixture claim ${UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID} — CASE_PROGRESSION, claimant role.`,
    pages: [
      {
        title: 'Upload your documents',
        path: withClaimId(UPLOAD_YOUR_DOCUMENTS_URL, UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID),
        status: 'ready',
      },
    ],
  },
  {
    title: 'General application',
    description: `Fixture claim ${UI_PREVIEW_GA_CLAIM_ID} — defendant role with a seeded general application so the GA guard allows the journey.`,
    pages: [
      {
        title: 'Application type',
        path: withClaimId(APPLICATION_TYPE_URL, UI_PREVIEW_GA_CLAIM_ID),
        status: 'ready',
        notes: 'Seeded generalApplications plus e2e GA Redis draft 1732194111758649.',
      },
    ],
  },
];
