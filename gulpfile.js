var gulp           = require('gulp');
//var plugins      = require('gulp-load-plugins');
var data           = require('gulp-data');
var sequence       = require('gulp-sequence');
var sass           = require('gulp-sass');
var concat         = require('gulp-concat');
var uglify         = require('gulp-uglify');
var nunjucksRender = require('gulp-nunjucks-render');
var htmlmin        = require('gulp-htmlmin');
var imagemin       = require('gulp-imagemin');
var markdown       = require('gulp-markdown');
var frontMatter    = require('gulp-front-matter');
var bSync          = require('browser-sync');
var reload         = bSync.reload;

gulp.task('pages', function() {
  return gulp.src('src/pages/**/*.html')
             .pipe(nunjucksRender({
               path: ['src/templates']
             }))
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest('dist'))
             .pipe(reload({stream: true}));
});

gulp.task('images', function() {
  return gulp.src('src/img/*')
             .pipe(imagemin())
             .pipe(gulp.dest('dist/img'))
             .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src('src/js/*')
             .pipe(uglify())
             .pipe(gulp.dest('dist/js'))
             .pipe(reload({stream: true}));
});

gulp.task('styles', function() {
  return gulp.src('src/sass/**/*.scss')
             .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
             .pipe(concat('all.min.css'))
             .pipe(gulp.dest('dist/css'))
             .pipe(reload({stream: true}));
});

gulp.task('posts', function() {
  return gulp.src('src/posts/**/*.md')
             .pipe(frontMatter({property: 'page', remove: true}))
             .pipe(markdown())
             .pipe(gulp.dest('dist/blog'))
             .pipe(reload({stream: true}));
});

gulp.task('sync', function() {
  return bSync({server: { baseDir: 'dist' }});
});

gulp.task('serve', function(cb) {
   return sequence('sync', cb);
});

gulp.task('assets', ['images', 'styles', 'scripts']);

gulp.task('content', function(cb) {
  return sequence('posts', 'pages', cb);
});

gulp.task('watch', function() {
  gulp.watch('src/js/**/*.js',      [ 'scripts']);
  gulp.watch('src/sass/**/*.scss',  [ 'styles']);
  gulp.watch('src/img/**/*',        [ 'images']);
  gulp.watch('src/posts/**/*.md',   [ 'content']);
  gulp.watch('src/pages/**/*.html', [ 'pages']);
});

gulp.task('default', sequence(['assets', 'content'], 'serve', 'watch'));
