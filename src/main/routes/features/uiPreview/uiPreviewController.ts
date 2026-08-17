import {Router, Request, Response} from 'express';
import {UI_PREVIEW_URL} from 'routes/urls';
import {getUiPreviewPageCatalog, UI_PREVIEW_FIXTURE_USER_ID} from 'services/features/uiPreview/pageCatalog';

const uiPreviewController = Router();
const viewPath = 'features/ui-preview/index';

uiPreviewController.get(UI_PREVIEW_URL, (_req: Request, res: Response) => {
  res.render(viewPath, {
    pageTitle: 'UI Preview',
    catalog: getUiPreviewPageCatalog(),
    fixtureUserId: UI_PREVIEW_FIXTURE_USER_ID,
    isUiPreview: true,
  });
});

export default uiPreviewController;
