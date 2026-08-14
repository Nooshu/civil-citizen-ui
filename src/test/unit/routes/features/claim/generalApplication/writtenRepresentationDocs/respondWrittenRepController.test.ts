import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { Claim } from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';
import * as generalApplicationResponseStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {DocumentType} from 'models/document/documentType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';

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
  saveWrittenRepText: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const claimId = '1234';
const appId = '5678';
const url = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PROVIDE_MORE_INFORMATION_URL);

function makeApplicationResponse(
  kind: 'sequential' | 'concurrent' | 'none' | 'sequential-mismatch' | 'concurrent-incomplete' = 'none',
): ApplicationResponse {
  const binary = 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046/binary';
  const sequentialDoc = {
    value: {
      documentType: DocumentType.WRITTEN_REPRESENTATION_SEQUENTIAL,
      documentLink: {document_binary_url: binary},
    },
  };
  const concurrentDoc = {
    value: {
      documentType: DocumentType.WRITTEN_REPRESENTATION_CONCURRENT,
      documentLink: {document_binary_url: binary},
    },
  };
  if (kind === 'sequential-mismatch') {
    return {
      case_data: {
        writtenRepSequentialDocument: [{value: {documentType: DocumentType.REQUEST_MORE_INFORMATION}}],
      },
    } as ApplicationResponse;
  }
  if (kind === 'concurrent-incomplete') {
    return {
      case_data: {
        writtenRepConcurrentDocument: [{value: {documentType: DocumentType.WRITTEN_REPRESENTATION_CONCURRENT}}],
      },
    } as ApplicationResponse;
  }
  return {
    case_data: {
      writtenRepSequentialDocument: kind === 'sequential' ? [sequentialDoc] : undefined,
      writtenRepConcurrentDocument: kind === 'concurrent' ? [concurrentDoc] : undefined,
    },
  } as ApplicationResponse;
}

describe('General Application - uploadDocumentsForWrittenRepController', () => {
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
    jest.spyOn(generalApplicationService, 'saveWrittenRepText').mockResolvedValue();
  });

  beforeEach(() => {
    claim = new Claim();
    claim.id = claimId;
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
    const response = new GaResponse();
    response.writtenRepText = 'Written Rep';
    mockGADocResponseStoreService.mockResolvedValue(response);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse());
  });

  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  describe('on GET', () => {
    it('should return respond page', async () => {
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Provide more information to the court');
        });
    });

    it('should render page with sequential written representation document link', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse('sequential'));
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render page with concurrent written representation document link', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse('concurrent'));
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return 500 when loading the page fails', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error('boom'));
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });

    it('should render when application response has no written rep documents', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(undefined as unknown as ApplicationResponse);
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render when sequential docs exist but none match written representation type', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse('sequential-mismatch'));
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should render when concurrent docs match type but have no document link', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(makeApplicationResponse('concurrent-incomplete'));
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });

  it('should return errors on no input', async () => {

    await request(app)
      .post(url)
      .send({option: null, writtenRepText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should return errors on error input', async () => {

    await request(app)
      .post(url)
      .send({option: 'no', writtenRepText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should return errors on  input text present and no button selected', async () => {

    await request(app)
      .post(url)
      .send({ writtenRepText: 'something'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to tell us if you want to upload documents to support your response. Choose option: Yes or No.');
      });
  });

  it('should save the value and redirect to upload docs when option is yes', async () => {
    await request(app)
      .post(url)
      .send({ option: YesNo.YES, writtenRepText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL),
        );
      });
  });

  it('should save the value and redirect to CYA when option is no', async () => {
    await request(app)
      .post(url)
      .send({ option: YesNo.NO, writtenRepText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL),
        );
      });
  });

  it('should return 500 when saving written rep text fails', async () => {
    jest.spyOn(generalApplicationService, 'saveWrittenRepText').mockRejectedValueOnce(new Error('save failed'));
    await request(app)
      .post(url)
      .send({ option: YesNo.YES, writtenRepText: 'details' })
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});
