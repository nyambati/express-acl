'use strict';
const { series, src, watch } = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-spawn-mocha-nyc');
const paths = {
  tests: 'tests/**/*.spec.js',
  scripts: [
    'lib/**',
    'tests/**',
    '!tests/config/*.yml',
    '!tests/config/*.json',
  ],
};

/**
 * - Gulp task for linting all js scripts
 */

exports.lint = () =>
  src(paths.scripts)
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.formatEach())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());

/**
 * Gulp task to run tests
 *
 */

exports.test = () =>
  src(paths.tests, { read: false }).pipe(mocha({ nyc: true, istanbul: true }));

/**
 * Watch for changes and lint in all ours scripts and lints
 */

exports.watch = () => {
  for (const path of paths.scripts) {
    watch(path, series(exports.lint));
  }
};

/**
 * Start gulp
 */

exports.default = series(exports.lint, exports.watch);
