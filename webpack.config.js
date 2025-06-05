const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    compress: true,
    port: 4000,
    open: true,
    hot: true,
  },module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],  resolve: {
    extensions: ['.js'],
    fallback: {
      "punycode": false,
      "util": false,
      "url": false,
      "os": false,
      "crypto": false,
      "buffer": false,
      "stream": false,
      "path": false,
      "fs": false
    }
  },
};