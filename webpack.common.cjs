const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('node:path');

module.exports = {
  entry: './src/index.ts',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'index.js',
    libraryTarget: 'module',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      // 复制.d.ts文件
      {
        test: /\.d\.ts$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
};
