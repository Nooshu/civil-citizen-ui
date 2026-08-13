const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Paths into the installed `@ministryofjustice/frontend` package.
 *
 * @remarks
 * Client JS for add-another still loads the vendored `mojAll.js` bundle because
 * MoJ Frontend v10 AddAnother requires updated page markup (`.moj-add-another__items`).
 * Keep these paths aligned with the package layout until that migration lands.
 */
const packageJson = require.resolve('@ministryofjustice/frontend/package.json');
const root = path.resolve(packageJson, '..', 'moj');
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.bundle.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');

const copyMojTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: images, to: 'assets/images' },
  ],
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyMojTemplateAssets],
};
