'use strict';

const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const i18n = require('gulp-html-i18n');
const inlinesource = require('gulp-inline-source');
const purgecss = require('gulp-purgecss');

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './',
      index: 'index-ro.html',
    },
    notify: false,
    port: 3000,
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function css() {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: './node_modules',
      })
    )
    .on('error', sass.logError)
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulp.dest('./css'))
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest('./css'))
    .pipe(browsersync.stream());
}

function js() {
  return gulp
    .src(['./js/*.js', '!./js/*.min.js'])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch('./scss/**/*', css);
  gulp.watch(['./js/**/*', '!./js/**/*.min.js'], js);
  gulp.watch('./index.html', translate);
  gulp.watch('./**/*.html', browserSyncReload);
}

function translate() {
  return gulp
    .src('./index.html')
    .pipe(
      i18n({
        langDir: './lang',
      })
    )
    .pipe(inlinesource())
    .pipe(gulp.dest('.'));
}

function clean() {
  return del(['./vendor/']);
}

function modules() {
  return gulp
    .src('./node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(
      purgecss({
        content: ['./index.html'],
        whitelist: ['show'],
      })
    )
    .pipe(gulp.dest('./vendor/bootstrap'));
}

function modulesDev() {
  return gulp
    .src('./node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest('./vendor/bootstrap'));
}

const vendor = gulp.series(clean, modules);
const vendorDev = gulp.series(clean, modulesDev)
const build = gulp.series(vendor, gulp.parallel(css, js), translate);
const dev = gulp.series(vendorDev, gulp.parallel(css, js), translate);
const watch = gulp.series(dev, gulp.parallel(watchFiles, browserSync));

exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.translate = translate;

exports.default = build;
