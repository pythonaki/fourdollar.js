const gulp = require('gulp');
const mocha = require('gulp-spawn-mocha');
const $4 = require('./fourdollar');
$4.node();
const path = require('path');


// mocha 처리.
gulp.task('mocha', () => {
  return gulp.src('test/*-test.js', {read: false})
    .pipe(mocha({
      // report 종류
      R: 'nyan'
    }));
});


gulp.task('watch', () => {
  gulp.watch('{.,test}/*.js', ['mocha']);
});


gulp.task('default', ['mocha', 'watch']);


gulp.task('release', () => {
  var fourdollar = path.resolve(__dirname, 'fourdollar.js');
  var libGitnote = path.resolve(__dirname, '../lib-gitnote/lib/fourdollar.js');
  var atomGitnote = path.resolve(__dirname, '../../Atom/atom-gitnote/lib/fourdollar.js');
  var test = path.resolve(__dirname, '../test/fourdollar.js');
  console.log('lib-gitnote release..');
  $4.copy(fourdollar, libGitnote);
  console.log('atom-gitnote release..');
  $4.copy(fourdollar, atomGitnote);
  console.log('test release..');
  $4.copy(fourdollar, test);
});
