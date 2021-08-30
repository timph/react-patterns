/* eslint-disable @typescript-eslint/no-var-requires */
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');
const RelayCompilerLanguageTypescript = require('relay-compiler-language-typescript');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const relayConfig = require('./relay.config');
const path = require('path');

// Sentry
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const {
  addTestDirToWebpack,
  setWebpackDevtool,
} = require('./build-utils/webpack');

require('dotenv').config();

const isTestEnv = process.env.NODE_ENV === 'test';
const instrumentForCoverage = process.env.COVERAGE;
const usePersistedQueries =
  process.env.REACT_APP_USE_PERSISTED_QUERIES === 'true';

const config = {
  babel: {
    plugins: [
      ...(isTestEnv && instrumentForCoverage
        ? [
            [
              'istanbul',
              {
                include: ['src'],
                exclude: [
                  '**/__generated__/**',
                  'src/locales/**',
                  'src/utils/mocks/**',
                  'src/components/proseries/**',
                  'src/routes/ProSeries/**',
                ],
              },
            ],
          ]
        : []),
    ],
    presets: ['@resideo/babel-preset-relay'],
  },
  webpack: {
    configure: webpackConfig => {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        cacache: path.join(__dirname, 'shims', 'empty.js'),
        express: path.join(__dirname, 'shims', 'empty.js'),
        prettier: path.join(__dirname, 'shims', 'empty.js'),
        '@sentry/node': path.join(__dirname, 'shims', 'empty.js'),
        fs: path.join(__dirname, 'shims', 'fs.js'),
        'fs-extra': path.join(__dirname, 'shims', 'fs.js'),
      };

      webpackConfig.resolve.mainFields = ['browser', 'main', 'module'];

      webpackConfig.plugins.push(
        new FilterWarningsPlugin({
          // nexus has things that use dynamic requires
          // they're not functionally requred for our use-case

          // so let's slience webpack
          exclude: /Critical dependency:/,
        })
      );

      if (!usePersistedQueries) {
        if (isTestEnv) {
          addTestDirToWebpack(webpackConfig);
          setWebpackDevtool(webpackConfig, 'eval-source-map');
        }

        webpackConfig.resolve.extensions = [
          '.web.mjs',
          '.mjs',
          '.web.js',
          '.js',
          '.web.ts',
          '.ts',
          '.web.tsx',
          '.tsx',
          '.json',
          '.web.jsx',
          '.jsx',
        ];

        webpackConfig.plugins.push(
          new RelayCompilerWebpackPlugin({
            src: path.resolve(__dirname, relayConfig.src),
            exclude: relayConfig.exclude,
            schema: relayConfig.schema,
            languagePlugin: RelayCompilerLanguageTypescript.default,
            config: {
              verbose: true,
              customScalars: relayConfig.customScalars,
            },
          })
        );
      }

      if (process.env.NODE_ENV !== 'development' && !isTestEnv) {
        webpackConfig.plugins.push(
          new SentryWebpackPlugin({
            authToken: process.env.REACT_APP_SENTRY_AUTH_TOKEN,
            org: process.env.REACT_APP_SENTRY_ORG,
            project: process.env.REACT_APP_SENTRY_PROJECT_NAME,
            include: './build/static/js',
            ignore: ['node_modules', 'webpack.config.js'],
            urlPrefix: '~/static/js',
            rewrite: true,
          })
        );
      }

      return webpackConfig;
    },
  },
};

module.exports = config;
