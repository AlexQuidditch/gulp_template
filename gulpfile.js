'use strict';

const gulp = require('gulp'),

      sass = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      assets = require('postcss-assets'),
      nested = require('postcss-nested'),
      cssnano = require('cssnano'),
      mqpacker = require("css-mqpacker"),

      sourcemaps = require('gulp-sourcemaps'),
      useref = require('gulp-useref'),

      uglify = require('gulp-uglify'),
      babel = require('gulp-babel'),

      gulpIf = require('gulp-if'),
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache'),
      del = require('del'),
      plumber = require('gulp-plumber'),
      runSequence = require('run-sequence'),
      browserSync = require('browser-sync').create(),

  sassOptions = {
    outputStyle: 'expanded',
    errLogToConsole: true
  },
  postOptions = [
    assets,
    nested
  ],
  buildOptions = [
    assets,
    nested,
    cssnano,
    mqpacker,
    autoprefixer({
      browsers: ["last 10 version"],
      cascade: !0
    })
  ];

gulp.task('sass', () => gulp.src('./app/src/scss/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass(sassOptions))
  .pipe(postcss(postOptions))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest('./app/css'))
  .pipe(browserSync.stream()));

gulp.task('babel', () =>
	gulp.src('./app/src/es/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./app/js'))
    .pipe(browserSync.stream()));

gulp.task('reload', ['watch'], done => {
  browserSync.reload();
  done();
});

// Watcher
gulp.task('watch', () => {
  gulp.watch('./app/src/scss/**/*.scss', ['sass']);
  gulp.watch('./app/src/es/*.js', ['babel']);
  gulp.watch('./app/js/**/*.js', ['reload']);
  gulp.watch('./app/*.html', ['reload']);
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  })
});
// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task('useref', () => gulp.src('./app/*.html')
  .pipe(plumber())
  .pipe(useref())
  .pipe(gulpIf('*.js', uglify()))
  .pipe(gulpIf('*.css', cssnano()))
  .pipe(plumber.stop())
  .pipe(gulp.dest('build/')));

// Copying fonts
gulp.task('fonts', () => gulp.src('./app/fonts/**/*')
  .pipe(gulp.dest('./build/fonts')))

// Copying assets
gulp.task('images', () => gulp.src('./app/assets/**/*.*')
  .pipe(gulp.dest('./build/assets')));

gulp.task('copies', () => gulp.src('./app/js/*.min.js')
  .pipe(gulpIf('*.js', gulp.dest('./build/js'))));

// Cleaning
gulp.task('clean', () => del.sync('./build')
  .then( cb => cache.clearAll(cb) ));

gulp.task('clean:app', () => del.sync(['./app/css/**/*']));

gulp.task('clean:build', () => del.sync(['./build/**/*', '!./build/assets', '!./build/assets/**/*']));

gulp.task('sass-build', () => gulp.src('./app/src/scss/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass(sassOptions))
  .pipe(postcss(postOptions))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest('./app/css')));

// Build Sequences

gulp.task('default', callback => {
  runSequence(
    ['sass', 'babel'],
    'watch', 'browser-sync',
    callback
  )
});

gulp.task('build', callback => {
  runSequence(
    'clean:build', 'sass-build', 'babel',
    ['useref', 'images', 'fonts', 'copies'],
    'clean:app',
    callback
  )
});
