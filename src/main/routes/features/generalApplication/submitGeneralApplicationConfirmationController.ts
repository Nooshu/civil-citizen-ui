import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';
import {
  getGeneralApplicationConfirmationContent,
  resolveGeneralApplicationFeePounds,
  resolveGeneralApplicationId,
} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const submitGeneralApplicationConfirmationViewPath = 'features/generalApplication/submit-general-application-confirmation';
const submitGeneralApplicationConfirmationController = Router();

submitGeneralApplicationConfirmationController.get(GENERAL_APPLICATION_CONFIRM_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const applicationFee = resolveGeneralApplicationFeePounds(req.query.appFee, claim);
    const genAppId = resolveGeneralApplicationId(req.query.id, claim);
    res.render(submitGeneralApplicationConfirmationViewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.TITLE', {lng}),
      confirmationContent: await getGeneralApplicationConfirmationContent(claimId, genAppId, claim, lng,applicationFee),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default submitGeneralApplicationConfirmationController;
