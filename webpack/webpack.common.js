const path = require('path');
const webpack = require('webpack');
const loaders = require('./loaders');
const plugins = require('./plugins');

module.exports = {
  entry: ['./src/js/gb.js'],
  module: {
    rules: [
      loaders.JSLoader,
      loaders.CSSLoader
    ]
  },
  output: {
    filename: 'gb.bundle.js',
    path: path.resolve(__dirname, '../assets/dist'),
    library: 'gb', // We set a library name to bundle the export default of the class
    libraryTarget: 'window', // Make it globally available
    libraryExport: 'default' // Make gb.default become gb
  },
  plugins: [
    new webpack.ProgressPlugin(),
    plugins.CleanWebpackPlugin,
    plugins.ESLintPlugin,
    plugins.StyleLintPlugin,
    plugins.MiniCssExtractPlugin
  ]
};
