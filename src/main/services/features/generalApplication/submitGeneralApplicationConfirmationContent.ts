import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {getCancelUrl, isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

/**
 * Confirmation GETs usually carry `appFee` in pounds from check-your-answers.
 * Catalogue and bookmarks omit it — fall back to the draft fee in pence.
 */
export const resolveGeneralApplicationFeePounds = (queryAppFee: unknown, claim: Claim): number | undefined => {
  if (queryAppFee != null && queryAppFee !== '') {
    const fromQuery = Number(queryAppFee);
    if (Number.isFinite(fromQuery)) {
      return fromQuery;
    }
  }
  const pence = claim.generalApplication?.applicationFee?.calculatedAmountInPence;
  if (pence == null) {
    return undefined;
  }
  const fromClaim = convertToPoundsFilter(pence);
  return Number.isFinite(fromClaim) ? fromClaim : undefined;
};

/**
 * `id` is the GA case id on the pay-fee URL. Fall back to the first linked application on the claim.
 */
export const resolveGeneralApplicationId = (queryId: unknown, claim: Claim): string | undefined => {
  if (typeof queryId === 'string' && queryId.length > 0) {
    return queryId;
  }
  return claim.generalApplications?.[0]?.value?.caseLink?.CaseReference;
};

function appendPayApplicationFeeUrl(claimId: string, genAppId: string | undefined, applicationFee: number | undefined): string {
  let payApplicationFeeUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION);
  payApplicationFeeUrl = genAppId ? payApplicationFeeUrl + `?id=${genAppId}` : payApplicationFeeUrl;
  if (Number.isFinite(applicationFee)) {
    payApplicationFeeUrl = payApplicationFeeUrl + (payApplicationFeeUrl.includes('?') ? '&' : '?') + 'appFee=' + applicationFee;
  }
  return payApplicationFeeUrl;
}

function feeCopyVariables(applicationFee: number | undefined): {applicationFee: number | string} {
  return {applicationFee: Number.isFinite(applicationFee) ? applicationFee : ''};
}

export const getGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  const payApplicationFeeUrl = appendPayApplicationFeeUrl(claimId, genAppId, applicationFee);
  const feeVariables = feeCopyVariables(applicationFee);
  const isCoScGeneralApplication = isConfirmYouPaidCcjDebtGA(claim);
  if (isCoScGeneralApplication) {
    return new PageSectionBuilder()
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', feeVariables)
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED_NEXT')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  } else {
    return new PageSectionBuilder()
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', feeVariables)
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  }
});

export const getCoScGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  const payApplicationFeeUrl = appendPayApplicationFeeUrl(claimId, genAppId, applicationFee);
  return new PageSectionBuilder()
    .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', feeCopyVariables(applicationFee))
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED_NEXT')
    .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
    .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
    .build();
});

function isConfirmYouPaidCcjDebtGA(claim: Claim): boolean {
  return isConfirmYouPaidCCJAppType(claim);
}
