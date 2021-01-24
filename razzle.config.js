/* eslint-disable @typescript-eslint/no-unused-vars */
const LoadableWebpackPlugin = require('@loadable/webpack-plugin');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // required by razzle
const path = require('path');

module.exports = {
  modifyWebpackConfig({
    env: {
      target, // the target 'node' or 'web'
      dev, // is this a development build? true or false
    },
    webpackConfig, // the created webpack config
    webpackObject, // the imported webpack node module
    options: {
      razzleOptions, // the modified options passed to Razzle in the `options` key in `razzle.config.js` (options: { key: 'value'})
      webpackOptions, // the modified options that will be used to configure webpack/ webpack loaders and plugins
    },
    paths, // the modified paths that will be used by Razzle.
  }) {
    // add loadable webpack plugin only
    // when we are building the client bundle
    if (target === 'web') {
      const filename = path.resolve(__dirname, 'build');

      // saving stats file to build folder
      // without this, stats files will go into
      // build/public folder
      webpackConfig.plugins.push(
        new LoadableWebpackPlugin({
          outputAsset: false,
          writeToDisk: { filename },
        })
      );
    }

    // use MiniCSSExtractPLugin instead default style-loader just like in prod mode
    // to avoid no-styled screen the first frame page rendered in dev mode
    if (target === 'web' && dev) {
      const styleLoaderFinder = makeLoaderFinder('style-loader');

      // [.css, .s(a|c)ss]
      const cssRulesList = webpackConfig.module.rules.filter(styleLoaderFinder);

      if (cssRulesList.every(cssRules => cssRules.use.findIndex(styleLoaderFinder) === 0)) {
        throw new Error(`[Thimble Razzle Plugin] style-loader was not found`);
      }
      cssRulesList.forEach(cssrules => cssrules.use.shift()); // remove style loader
      cssRulesList.forEach(cssrules => cssrules.use.unshift(MiniCssExtractPlugin.loader));
      webpackConfig.plugins.push(
        new MiniCssExtractPlugin({
          filename: `${razzleOptions.cssPrefix}/bundle.[chunkhash:8].css`,
          chunkFilename: `${razzleOptions.cssPrefix}/[name].[chunkhash:8].chunk.css`,
        })
      );
    }

    return webpackConfig;
  },
};
