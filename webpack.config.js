let path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

let dist_folder = path.resolve(__dirname, 'dist') + "/";

module.exports = {
  mode: 'development',
  entry: './dist/src/index.js',
  output: {
    path: dist_folder,
    filename: 'index.min.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '*.*', to: dist_folder, context: "public/"}
      ],
    }),
  ],
};