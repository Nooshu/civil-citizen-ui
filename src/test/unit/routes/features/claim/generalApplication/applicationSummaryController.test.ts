import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { app } from '../../../../../../main/app';
import { GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { t } from 'i18next';
import { Claim } from 'models/claim';
import { isGaForLipsEnabled } from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { GaServiceClient } from 'client/gaServiceClient';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { decode } from 'punycode';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { ApplicationResponse, JudicialDecisionOptions } from 'common/models/generalApplication/applicationResponse';
import {CivilServiceClient} from 'client/civilServiceClient';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import * as gaResponseService from 'services/features/generalApplication/response/generalApplicationResponseService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseService', () => ({
  ...jest.requireActual('services/features/generalApplication/response/generalApplicationResponseService'),
  isApplicationVisibleToRespondentForClaimant: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('General Application - Application costs', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    (gaResponseService.isApplicationVisibleToRespondentForClaimant as jest.Mock)
      .mockImplementation(jest.requireActual('services/features/generalApplication/response/generalApplicationResponseService')
        .isApplicationVisibleToRespondentForClaimant);
  });

  describe('on GET', () => {
    const applicationMock: ApplicationResponse = {
      id: '1234567890',
      case_data: {
        applicationTypes: 'Adjourn a hearing',
        generalAppType: null,
        generalAppRespondentAgreement: null,
        generalAppInformOtherParty: null,
        generalAppAskForCosts: null,
        generalAppDetailsOfOrder: null,
        generalAppReasonsOfOrder: null,
        generalAppEvidenceDocument: null,
        gaAddlDoc: null,
        generalAppHearingDetails: null,
        generalAppStatementOfTruth: null,
        generalAppPBADetails: null,
        applicationFeeAmountInPence: null,
        parentClaimantIsApplicant: null,
        judicialDecision: {
          decision: JudicialDecisionOptions.MAKE_AN_ORDER,
        },
      },
      state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
      last_modified: '2024-05-29T14:39:28.483971',
      created_date: '2024-05-29T14:39:28.483971',
    };

    it('should return page', async () => {
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '1234567890',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      jest
        .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([applicationMock]);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.TITLE'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION') + ' 1');
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.DETAILS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.AWAITING_RESPONDENT_RESPONSE'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.IN_PROGRESS'));
          expect(decode(res.text)).toContain(applicationMock.case_data.applicationTypes);
          expect(decode(res.text)).toContain(applicationMock.id);
          expect(decode(res.text)).toContain('29 May 2024, 2:39:28 pm');
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.VIEW_APPLICATION'));
        });
    });

    it('should show Strike out when the GA payload stores the enum key', async () => {
      const enumKeyApplication = structuredClone(applicationMock);
      enumKeyApplication.case_data.applicationTypes = 'STRIKE_OUT';
      enumKeyApplication.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [{
        id: 'test',
        value: {
          caseLink: {CaseReference: enumKeyApplication.id},
          generalAppSubmittedDateGAspec: new Date(enumKeyApplication.created_date),
        },
      }];
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([enumKeyApplication]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).toContain('Strike out');
          expect(decode(res.text)).not.toContain('APPLICATION_TYPE_CCD.undefined');
        });
    });

    it('should use language from cookie when query is absent', async () => {
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [
        {
          id: 'test',
          value: {
            caseLink: {CaseReference: '1234567890'},
            generalAppSubmittedDateGAspec: new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([applicationMock]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .set('Cookie', ['lang=en'])
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render status for respondent when parent claimant is not applicant', async () => {
      const respondentApplication = structuredClone(applicationMock);
      respondentApplication.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [{
        id: 'test',
        value: {
          caseLink: {CaseReference: respondentApplication.id},
          generalAppSubmittedDateGAspec: new Date(respondentApplication.created_date),
        },
      }];
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([respondentApplication]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render multiple application types for a claimant applicant', async () => {
      const multiTypeApplication = structuredClone(applicationMock);
      multiTypeApplication.case_data.applicationTypes = 'Adjourn a hearing, Vary order';
      multiTypeApplication.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.YES;
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [{
        id: 'test',
        value: {
          caseLink: {CaseReference: multiTypeApplication.id},
          generalAppSubmittedDateGAspec: new Date(multiTypeApplication.created_date),
        },
      }];
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([multiTypeApplication]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .query({lang: 'cy'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).toContain(',');
        });
    });

    it('should render when a visible application has no case_data', async () => {
      (gaResponseService.isApplicationVisibleToRespondentForClaimant as jest.Mock).mockReturnValue(true);
      jest.spyOn(generalApplicationService, 'getViewApplicationUrl').mockReturnValue('/view-application');
      const sparseApplication = {
        id: '999',
        state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        last_modified: '2024-05-29T14:39:28.483971',
        created_date: '2024-05-29T14:39:28.483971',
      } as ApplicationResponse;
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [{
        id: 'test',
        value: {
          caseLink: {CaseReference: sparseApplication.id},
          generalAppSubmittedDateGAspec: new Date(sparseApplication.created_date),
        },
      }];
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([sparseApplication]);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render an empty summary when GA service returns no applications', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      jest.spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce(undefined);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(new Claim());

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).not.toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION') + ' 1');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
