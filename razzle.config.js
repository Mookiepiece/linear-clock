/* eslint-disable @typescript-eslint/no-unused-vars */
const LoadableWebpackPlugin = require('@loadable/webpack-plugin');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // required by razzle
const path = require('path');

module.exports = {
  plugins: ['scss'],
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
  modifyBabelOptions(defaultBabelOptions, { tagert, dev }) {
    var env = process.env.BABEL_ENV || process.env.NODE_ENV;
    if (env !== 'development' && env !== 'test' && env !== 'production') {
      throw new Error(
        'Using `babel-preset-razzle` requires that you specify `NODE_ENV` or ' +
          '`BABEL_ENV` environment variables. Valid values are "development", ' +
          '"test", and "production". Instead, received: ' +
          JSON.stringify(env) +
          '.'
      );
    }

    return {
      ...defaultBabelOptions,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            useBuiltIns: 'usage',
            corejs: 3,
            modules: false,
          },
        ],
        require.resolve('@babel/preset-react'),
        require.resolve('@babel/preset-typescript'),
      ],
      plugins: [
        // Add support for async/await
        require.resolve('@babel/plugin-transform-runtime'),

        '@loadable/babel-plugin',
      ],

      env: {
        test: {
          plugins: [
            // Compiles import() to a deferred require()
            require.resolve('babel-plugin-dynamic-import-node'),
            // Transform ES modules to commonjs for Jest support
            [require.resolve('@babel/plugin-transform-modules-commonjs'), { loose: true }],
          ],
        },
        production: {
          plugins: [require.resolve('babel-plugin-transform-react-remove-prop-types')],
        },
      },
    };
  },
};
