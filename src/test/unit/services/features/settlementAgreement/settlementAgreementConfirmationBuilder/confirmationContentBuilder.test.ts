import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {DocumentType} from 'models/document/documentType';
import {
  buildNextStepsSection,
  buildPanelSection,
} from 'services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const lang = 'en';

function baseClaim(): Claim {
  const claim = new Claim();
  claim.id = '123';
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({partyName: 'Claimant Co'});
  claim.applicant1.type = PartyType.INDIVIDUAL;
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Dave'});
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.claimantResponse = new ClaimantResponse();
  return claim;
}

describe('settlementAgreement confirmationContentBuilder', () => {
  describe('buildPanelSection', () => {
    it('should return accept confirmation panel', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
      claim.systemGeneratedCaseDocuments = [{
        id: '1',
        value: {
          documentType: DocumentType.SETTLEMENT_AGREEMENT,
          documentLink: {document_url: 'http://dm/documents/doc-1', document_binary_url: 'http://dm/documents/doc-1/binary', document_filename: 'sa.pdf'},
        },
      }] as never;
      const result = buildPanelSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.ACCEPTED_SETTLEMENT_AGREEMENT_TITLE');
      expect(result[0].data?.html).toContain('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.DOWNLOAD_SETTLEMENT_AGREEMENT_LINK_TEXT');
    });

    it('should return reject confirmation panel', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.NO;
      const result = buildPanelSection(claim, lang);
      expect(result[0].data?.title).toContain('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REJECTED_SETTLEMENT_AGREEMENT_TITLE');
    });

    it('should return undefined when settlement response missing', () => {
      expect(buildPanelSection(baseClaim(), lang)).toBeUndefined();
    });
  });

  describe('buildNextStepsSection', () => {
    it('should return reject next steps', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.NO;
      const result = buildNextStepsSection(claim, lang);
      expect(result[0].data?.text).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      expect(result[1].data?.text).toEqual('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CAN_REQUEST_CCJ');
    });

    it('should return accept next steps with court accepted immediately payment', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
      claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2035-06-01');
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.IMMEDIATELY);
      const result = buildNextStepsSection(claim, lang);
      expect(result.some(s => s.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY')).toBe(true);
      expect(result.some(s => s.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.CANT_REQUEST_CCJ')).toBe(true);
      expect(result.some(s => s.data?.href?.includes('/dashboard/123/contact-them'))).toBe(true);
    });

    it('should return accept next steps with court accepted set date', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date('2035-07-01') as never;
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(true);
      jest.spyOn(claim, 'getSuggestedPaymentIntentionOptionFromClaimant').mockReturnValue(PaymentOptionType.BY_SET_DATE);
      const result = buildNextStepsSection(claim, lang);
      expect(result.some(s => s.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY')).toBe(true);
    });

    it('should return accept next steps with defendant payment by set date', () => {
      const claim = baseClaim();
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
      jest.spyOn(claim, 'hasCourtAcceptedClaimantsPlan').mockReturnValue(false);
      jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(true);
      jest.spyOn(claim, 'getPaymentDate').mockReturnValue(new Date('2035-08-01'));
      const result = buildNextStepsSection(claim, lang);
      expect(result.some(s => s.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.PAY_BY')).toBe(true);
      expect(result.some(s => s.data?.text === 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.GET_RECEIPTS')).toBe(true);
    });

    it('should return undefined when settlement response missing', () => {
      expect(buildNextStepsSection(baseClaim(), lang)).toBeUndefined();
    });
  });
});
