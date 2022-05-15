const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const variable = require('./webpack-utils/variable');
const resolveConfig = require('./webpack-utils/resolve');
const plugins = require('./webpack-utils/plugins');
const { SRC_PATH, DIST_PATH, IS_DEV, IS_PRO, getCDNPath } = variable;
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const lessModuleRegex = /\.module\.less$/;
const postcssNormalize = require('postcss-normalize');
const paths = require('./paths');

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    IS_DEV && require.resolve('style-loader'),
    IS_PRO && {
      loader: MiniCssExtractPlugin.loader,
      // css is located in `static/css`, use '../../' to locate index.html folder
      // in production `paths.publicUrlOrPath` can be a relative path
      options: paths.publicUrlOrPath.startsWith('.')
        ? { publicPath: '../../' }
        : {},
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          // Adds PostCSS Normalize as the reset css with default options,
          // so that it honors browserslist config in package.json
          // which in turn let's users customize the target behavior as per their needs.
          postcssNormalize(),
        ],
        sourceMap: IS_PRO ? shouldUseSourceMap : IS_DEV,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: {
          sourceMap: IS_PRO ? shouldUseSourceMap : IS_DEV,
          root: paths.appSrc,
        },
      },
      {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
        },
      }
    );
  }
  return loaders;
};

const config = {
  entry: {
    index: path.join(SRC_PATH, 'index.tsx'),
  },
  output: {
    path: DIST_PATH,
    filename: IS_DEV
      ? 'js/[name].bundle.js'
      : 'js/[name].[contenthash:8].bundle.js',
    publicPath: getCDNPath(),
    globalObject: 'this',
    chunkFilename: IS_DEV
      ? 'js/[name].chunk.js'
      : 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true,
  },
  //loader的执行顺序默认从右到左，多个loader用[],字符串只用一个loader，也可以是对象的格式
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        include: [SRC_PATH],
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length * 2,
              parallel: true,
            },
          },
          {
            loader: 'babel-loader', // 这是一个webpack优化点，使用缓存
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: [/node_modules/, /public/, /(.|_)min\.js$/],
      },
      {
        test: /\.css$|\.less$/i,
        include: [SRC_PATH],
        exclude: [
          /node_modules/, // 取消匹配node_modules里面的文件
          lessModuleRegex,
        ],
        use: [
          IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
              sourceMap: !IS_PRO,
            },
          },
          {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve('postcss-loader'),
            options: {
              // Necessary for external CSS imports to work
              // https://github.com/facebook/create-react-app/issues/2677
              postcssOptions: {
                // ident: 'postcss',
                plugins: () => [
                  require('postcss-flexbugs-fixes'),
                  require('postcss-preset-env')({
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  }),
                  // Adds PostCSS Normalize as the reset css with default options,
                  // so that it honors browserslist config in package.json
                  // which in turn let's users customize the target behavior as per their needs.
                  postcssNormalize(),
                ],
              },
              sourceMap: IS_PRO ? shouldUseSourceMap : IS_DEV,
            },
          },
          'less-loader',
          {
            loader: 'style-resources-loader',
            options: {
              patterns: path.resolve(SRC_PATH, 'assets', 'css', 'core.scss'),
            },
          },
        ],
      },
      // {
      //   test: sassModuleRegex,
      //   use: getStyleLoaders(
      //     {
      //       importLoaders: 3,
      //       sourceMap: IS_DEV,
      //       modules: {
      //         getLocalIdent: getCSSModuleLocalIdent,
      //       },
      //     },
      //     'sass-loader'
      //   ),
      // },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[hash][ext][query]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash][ext][query]',
        },
      },
    ],
  },
  resolve: resolveConfig,
  plugins: plugins.getPlugins(),
};

module.exports = config;
