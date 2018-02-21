import path from 'path';
import webpack from 'webpack';
import webpackConfig from './webpack.config';

const config = Object.assign({}, webpackConfig, {
  entry: {
    app: [
      'babel-polyfill',
      path.join(__dirname, 'client/app/main.ts')
    ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
});

config.plugins = config.plugins.concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    mangle: {
      except: ['$', 'exports']
    }
  })
]);

export default config;
