var gulp           = require('gulp');
var data           = require('gulp-data');
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('pages', function() {
  return gulp.src("src/pages/**/*.html")
             .pipe(nunjucksRender({
               path: ["src/templates"]
             }))
             .pipe(gulp.dest("dist"));
});

gulp.task('default', ['pages']);
