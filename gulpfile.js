(function() {
  'use strict';

  var gulp = require('gulp');
  var plugins = require('gulp-load-plugins')();
  var paths = {
    tests: ['tests/**/**.js'],
    scripts: ['lib/**', 'tests/**', '!tests/config/**.yml']
  };

  /**
   * - Gulp task for linting all js scripts
   */

  gulp.task('lint', function() {
    return gulp.src(paths.scripts)
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish', { verbose: true }));
  });

  /**
   * Gulp task to run tests
   *
   */

  gulp.task('test', ['pre-test'], function() {
    return gulp.src(paths.tests, { read: false })
      // The reporter can be changed to preferable one
      .pipe(plugins.mocha())
      // Creating the reports after tests ran
      .pipe(plugins.istanbul.writeReports())
      // Enforce a coverage of at least 90%
      .pipe(plugins.istanbul.enforceThresholds({
        thresholds: { global: 90 }
      }));
  });

  /**
   * Watch for changes and lint in all ours scripts and lints
   */
  gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['lint']);
  });

  gulp.task('pre-test', function() {
    return gulp.src(['lib/**/*.js', 'index.js'])
      // Covering files
      .pipe(plugins.istanbul())
      // Force `require` to return covered files
      .pipe(plugins.istanbul.hookRequire());
  });

  /**
   * Start gulp
   */

  gulp.task('default', ['lint', 'watch']);
})();
