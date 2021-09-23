const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    content: './src/content.js',
    background: './src/background.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/build')
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/assets',
          to: 'assets',
        },
        {
          from: './src/manifest.json'
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test:  /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties'],
          }
        },
      }
    ],
  }
}
