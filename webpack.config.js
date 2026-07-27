const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: { loader: 'ts-loader', options: { transpileOnly: true } },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: undefined,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html', '**/index.html.tmpl'],
            },
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devServer: {
      static: { directory: path.resolve(__dirname, 'public') },
      port: 5173,
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      open: false,
    },
    performance: { hints: false },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
  };
};
