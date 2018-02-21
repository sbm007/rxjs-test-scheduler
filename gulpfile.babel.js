import gulp from 'gulp';
import webpack from 'webpack';
import path from 'path';
import gutil from 'gulp-util';
import serve from 'browser-sync';
import del from 'del';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import colorsSupported from 'supports-color';
import devConfig from './webpack.dev.config';
import distConfig from './webpack.dist.config';

const paths = {
  baseDir: 'client',
  distFolder: path.join(__dirname, 'dist')
};

gulp.task('serve', () => {
  process.env.NODE_ENV = JSON.stringify('development');
  const compiler = webpack(devConfig);

  serve({
    port: 3000,
    open: false,
    server: { baseDir: paths.baseDir },
    ghostMode: false,
    notify: false,
    middleware: [
      webpackDevMiddleware(compiler, {
        noInfo: true,
        stats: {
          colors: colorsSupported,
          chunks: false,
          modules: false,
          errorDetails: true
        }
      }),
      webpackHotMiddleware(compiler)
    ]
  });
});

gulp.task('build', ['clean'], (cb) => {
  webpack(distConfig, (error, stats) => {
    if (error) {
      throw new gutil.PluginError('webpack', error);
    }

    gutil.log('[webpack]', stats.toString({
      colors: colorsSupported,
      chunks: false,
      modules: false,
      errorDetails: true
    }));

    cb();
  });
});

gulp.task('clean', () => {
  return del([paths.distFolder]).then((paths) => {
    gutil.log('[clean]', paths);
  });
});

gulp.task('default', ['serve']);
