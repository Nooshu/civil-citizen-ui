import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { Claim } from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {
  GA_RESPOND_ADDITIONAL_INFO_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';
import * as generalApplicationResponseStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {DocumentType} from 'models/document/documentType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store/draftGADocumentService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
  getCancelUrl: jest.fn(),
  saveAdditionalText: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const claimId = '1234';
const appId = '5678';
const pageUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);

function makeApplicationResponse(withDoc: boolean, incomplete = false): ApplicationResponse {
  if (!withDoc) {
    return {case_data: {}} as ApplicationResponse;
  }
  const binary = 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046/binary';
  return {
    case_data: {
      requestForInformationDocument: [{
        value: {
          documentType: DocumentType.REQUEST_MORE_INFORMATION,
          documentLink: incomplete ? undefined : {document_binary_url: binary},
        },
      }],
    },
  } as ApplicationResponse;
}

describe('General Application - uploadDocumentsForRequestMoreInfoController', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  const mockGADocDataFromStore = jest.spyOn(draftServiceGA, 'getGADocumentsFromDraftStore');
  const mockGADocResponseStoreService = jest.spyOn(generalApplicationResponseStoreService, 'getDraftGARespondentResponse');
  let claim: Claim;
  let uploadDocuments: UploadGAFiles[];
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
    jest.spyOn(generalApplicationService, 'getCancelUrl').mockResolvedValue('/cancel-url');
    jest.spyOn(generalApplicationService, 'saveAdditionalText').mockResolvedValue();
  });

  beforeEach(() => {
    claim = new Claim();
    claim.id = claimId;
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
    const response = new GaResponse();
    response.additionalText = 'More info';
    mockGADocResponseStoreService.mockResolvedValue(response);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse(false));
  });

  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  describe('on GET', () => {
    it('should return respond page', async () => {
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Provide more information to the court');
        });
    });

    it('should return respond page with request more information document url', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse(true));
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return respond page when request more information document has no link', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse(true, true));
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return respond page when request more information document list has no matching type', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue({
        case_data: {
          requestForInformationDocument: [{value: {documentType: DocumentType.HEARING_FORM}}],
        },
      } as ApplicationResponse);
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return respond page when application response is undefined', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(undefined as unknown as ApplicationResponse);
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return 500 when loading the page fails', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error('boom'));
      await request(app)
        .get(pageUrl)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });

  it('should return errors on no input', async () => {
    await request(app)
      .post(pageUrl)
      .send({option: null, additionalText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should return errors on error input', async () => {
    await request(app)
      .post(pageUrl)
      .send({option: 'no', additionalText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should save and redirect to upload docs when option is yes', async () => {
    await request(app)
      .post(pageUrl)
      .send({ option: YesNo.YES, additionalText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL),
        );
      });
  });

  it('should save and redirect to CYA when option is no', async () => {
    await request(app)
      .post(pageUrl)
      .send({ option: YesNo.NO, additionalText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL),
        );
      });
  });

  it('should return 500 when saving additional text fails', async () => {
    jest.spyOn(generalApplicationService, 'saveAdditionalText').mockRejectedValueOnce(new Error('save failed'));
    await request(app)
      .post(pageUrl)
      .send({ option: YesNo.YES, additionalText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});
