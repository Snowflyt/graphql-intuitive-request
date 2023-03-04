const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.cjs');

const devConfig = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
};

module.exports = merge(commonConfig, devConfig);
