const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';
const filename = `[name]${fileNameSuffix}.css`;

const miniCss = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename,
  chunkFilename: '[id].css',
});

module.exports = {
  rules: [
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: false,
          },
        },
        {
          loader: 'css-loader',
          options: {
            url: false,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            // Quiet dependency @import noise; silence Dart Sass deprecations until @use migration.
            // https://frontend.design-system.service.gov.uk/import-css/#silence-deprecation-warnings-from-dependencies-in-dart-sass
            sassOptions: {
              quietDeps: true,
              silenceDeprecations: ['import', 'legacy-js-api'],
            },
          },
        },
      ],
    },
  ],
  plugins: [miniCss],
};
