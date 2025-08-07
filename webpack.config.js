let path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

let dist_folder = path.resolve(__dirname, 'dist') + "/";

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: dist_folder,
    filename: 'index.min.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '*.*', to: dist_folder, context: "public/"},
        { from: 'app.db', to: dist_folder, context: "sql/"},
      ],
    }),
  ],
};