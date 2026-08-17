import {
  ACCESSIBILITY_STATEMENT_URL,
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

/** Fixture claim IDs seeded in e2e Redis / WireMock for UI Preview. */
export const UI_PREVIEW_FIXTURE_CLAIM_ID = '1645882162449409';
export const UI_PREVIEW_FIXTURE_USER_ID = 'someID';

const withClaimId = (template: string, claimId: string = UI_PREVIEW_FIXTURE_CLAIM_ID): string =>
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
    description: 'Create a draft claim via testing support, then continue the issue journey.',
    pages: [
      {
        title: 'Create draft claim (testing support)',
        path: TESTING_SUPPORT_URL,
        status: 'ready',
        notes: 'Uses WireMock fees/events. Preferred way to start a claim in preview.',
      },
      {title: 'Claim amount', path: CLAIM_AMOUNT_URL, status: 'stub', notes: 'Needs an existing draft claim in Redis.'},
      {
        title: 'Claimant task list',
        path: CLAIMANT_TASK_LIST_URL,
        status: 'stub',
        notes: 'Populate via create-draft-claim first.',
      },
    ],
  },
  {
    title: 'Dashboard & response (fixture claim)',
    description: `Uses fixture claim ${UI_PREVIEW_FIXTURE_CLAIM_ID} (user ${UI_PREVIEW_FIXTURE_USER_ID}) from e2e Redis + WireMock.`,
    pages: [
      {title: 'Dashboard', path: DASHBOARD_URL, status: 'ready'},
      {
        title: 'Defendant claim summary',
        path: withClaimId(DEFENDANT_SUMMARY_URL),
        status: 'ready',
        notes: 'WireMock GET /cases/1645882162449409',
      },
      {
        title: 'Contact them',
        path: withClaimId(CITIZEN_CONTACT_THEM_URL),
        status: 'ready',
      },
      {
        title: 'Response task list',
        path: withClaimId(RESPONSE_TASK_LIST_URL),
        status: 'ready',
      },
      {
        title: 'Claim details (response)',
        path: withClaimId(CLAIM_DETAILS_URL),
        status: 'ready',
      },
      {
        title: 'Your details',
        path: withClaimId(CITIZEN_DETAILS_URL),
        status: 'ready',
      },
      {
        title: 'Your date of birth',
        path: withClaimId(DOB_URL),
        status: 'ready',
      },
      {
        title: 'Your phone',
        path: withClaimId(CITIZEN_PHONE_NUMBER_URL),
        status: 'ready',
      },
      {
        title: 'Response type',
        path: withClaimId(CITIZEN_RESPONSE_TYPE_URL),
        status: 'ready',
      },
    ],
  },
  {
    title: 'Further journeys (stub)',
    description: 'Linked for discovery; expect incomplete WireMock coverage until fixtures are extended.',
    pages: [
      {
        title: 'Case progression upload documents',
        path: `/case/${UI_PREVIEW_FIXTURE_CLAIM_ID}/case-progression/upload-your-documents`,
        status: 'stub',
      },
      {
        title: 'General application application type',
        path: `/case/${UI_PREVIEW_FIXTURE_CLAIM_ID}/general-application/application-type`,
        status: 'stub',
      },
      {
        title: 'Claimant response task list',
        path: `/case/${UI_PREVIEW_FIXTURE_CLAIM_ID}/claimant-response/task-list`,
        status: 'stub',
      },
    ],
  },
];
