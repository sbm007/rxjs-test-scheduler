import path from 'path';
import webpack from 'webpack';
import webpackConfig from './webpack.config';

const config = Object.assign({}, webpackConfig, {
  entry: {
    app: [
      'webpack-hot-middleware/client?reload=true',
      'babel-polyfill',
      path.join(__dirname, 'client/app/main.ts')
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'client')
  },
  devtool: 'inline-source-map'
});

config.plugins = config.plugins.concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development')
    }
  }),
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin()
]);

export default config;
