let path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

let dist_folder = path.resolve(__dirname, 'dist') + "/";

module.exports = {
  mode: 'production',
  entry: './dist/index.js',
  output: {
    path: dist_folder,
    filename: 'index.min.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'canvasjs.min.js', to: dist_folder },
        { from: 'fixed-data-table.css', to: dist_folder },
        { from: 'index.html', to: dist_folder },
        { from: '*.png', to: dist_folder },
        { from: '*.wav', to: dist_folder },
        { from: 'sql/app.db', to: dist_folder },
      ],
    }),
  ],
};