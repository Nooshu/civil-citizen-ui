import {
  mapperDefendantResponseToDocumentView,
  mapperMediationAgreementToDocumentView,
  getDocumentId,
} from 'common/mappers/documentViewMapper';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {MEDIATION_AGREEMENT_MOCK} from '../../../../utils/mocks/Mediation/mediationAgreementMock';
import {Claim} from 'models/claim';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

describe('Test of Document View Mapper', () => {

  it('should map Mediation agreement to Document View', () => {
    //Given
    const mediationAgreement = MEDIATION_AGREEMENT_MOCK();
    const expected = new DocumentsViewComponent('PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE', Array.of(
      new DocumentInformation(
        mediationAgreement.case_data.mediationAgreement.name,
        formatDateToFullDate(mediationAgreement.case_data.mediationSettlementAgreedAt, 'lang'),
        new DocumentLinkInformation(
          CASE_DOCUMENT_VIEW_URL.replace(':id', mediationAgreement.id).replace(':documentId',
            documentIdExtractor(mediationAgreement.case_data.mediationAgreement.document.document_binary_url)),
          mediationAgreement.case_data.mediationAgreement.document.document_filename))));
    //When
    const result = mapperMediationAgreementToDocumentView(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      mediationAgreement.case_data.mediationAgreement,
      mediationAgreement.case_data.mediationSettlementAgreedAt,
      mediationAgreement.id,
      'en',
    );
    //Then
    expect(expected).toEqual(result);
  });

  it('should return an empty documents table when the mediation agreement file is missing', () => {
    const result = mapperMediationAgreementToDocumentView(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      undefined,
      undefined,
      '1645882162449409',
      'en',
    );
    expect(result).toEqual(new DocumentsViewComponent(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      [],
    ));
  });

  it('should map defendant response to Document View', () => {
    //Given
    const claim = new Claim();
    claim.legacyCaseReference = '000JE001';
    claim.respondent1ResponseDate = new Date();
    const claimId = '1234';
    const fileName = 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL';

    const expected = new DocumentsViewComponent('PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE', Array.of(
      new DocumentInformation(
        fileName,
        formatDateToFullDate(claim.respondent1ResponseDate, 'lang'),
        new DocumentLinkInformation(
          CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
            .replace(':documentId',
              getDocumentId(claim, 'Stitched')),
          'defendant-response-000JE001.pdf'))));
    //When
    const result = mapperDefendantResponseToDocumentView(
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
      claim,
      claimId,
      'en',
    );
    //Then
    expect(expected).toEqual(result);
  });

  it('should map defendant response(stitched document) to Document View', () => {
    //Given
    const claim = new Claim();
    claim.legacyCaseReference = '000JE001';
    claim.respondent1ResponseDate = new Date();
    claim.systemGeneratedCaseDocuments = [
      {
        value: {
          documentLink: {
            document_binary_url: '/543/binary',
          },
          documentName: 'Stitched document',
          documentType: DocumentType.DEFENDANT_DEFENCE,
        },
      },
    ] as SystemGeneratedCaseDocuments[];
    const claimId = '1234';
    const fileName = 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL';

    const expected = new DocumentsViewComponent('PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE', Array.of(
      new DocumentInformation(
        fileName,
        formatDateToFullDate(claim.respondent1ResponseDate, 'lang'),
        new DocumentLinkInformation(
          CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
            .replace(':documentId',
              getDocumentId(claim, 'Stitched')),
          'defendant-response-000JE001.pdf'))));
    //When
    const result = mapperDefendantResponseToDocumentView(
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
      claim,
      claimId,
      'en',
    );
    //Then
    expect(expected).toEqual(result);
  });

  it('should not format a missing response date as Invalid DateTime', () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC603';
    const result = mapperDefendantResponseToDocumentView(
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
      claim,
      '1645882162449603',
      'en',
    );
    expect(result.documents[0].uploadDate).toBe('');
    expect(result.documents[0].uploadDate).not.toContain('Invalid DateTime');
  });

  it('should format a CCD ISO response date string', () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC603';
    claim.respondent1ResponseDate = '2022-09-25T13:46:07.287428Z' as unknown as Date;
    const result = mapperDefendantResponseToDocumentView(
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
      claim,
      '1645882162449603',
      'en',
    );
    expect(result.documents[0].uploadDate).toBe('25 September 2022');
  });

  it('should use the defence document timestamp when the response date is missing', () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC603';
    claim.systemGeneratedCaseDocuments = [
      {
        value: {
          documentLink: {document_binary_url: '/a1b2c3d4-9603-4e5f-8a9b-000000000603/binary'},
          documentName: 'defendant-response-000MC603.pdf',
          documentType: DocumentType.DEFENDANT_DEFENCE,
          createdDatetime: '2022-09-25T13:46:07.287428Z' as unknown as Date,
        },
      },
    ] as SystemGeneratedCaseDocuments[];
    const result = mapperDefendantResponseToDocumentView(
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
      'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
      claim,
      '1645882162449603',
      'en',
    );
    expect(result.documents[0].uploadDate).toBe('25 September 2022');
  });
});

