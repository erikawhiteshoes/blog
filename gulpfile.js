(function(){
  var self = this;
  var gulp           = require('gulp');
  var plugins        = require('gulp-load-plugins')();
  var bSync          = require('browser-sync');
  var through2       = require('through2');
  var fs             = require('fs');
  var reload         = bSync.reload;

  var site = {
    title: "Erika's awesome blab spot",
    root: "/"
  };


    var collectPosts = function() {
      var posts = [];

      return through2.obj(function(file, enc, next) {
        var post = file.page;
        var filename = file.relative.split(".")[0];
        post.body = file.contents.toString();
        post.image = filename + ".img";  // call function here something based on file
        post.summary = summarize(post.body);
        posts.push(post);
        this.push(file);
        next();
      }, function(done) {
      site.posts = posts;
      done();
      });
    };

  var summarize = function(html) {
    return html.split("<!--more-->")[0];
  };

  gulp.task('pages', function() {
    return gulp.src('src/pages/**/*.html')
              .pipe(plugins.data({site: site}))
              .pipe(plugins.nunjucksRender({
                path: ['src/templates']
              }))
              .pipe(plugins.htmlmin({collapseWhitespace: true}))
              .pipe(gulp.dest('dist'))
              .pipe(reload({stream: true}));
  });

  gulp.task('posts', function() {
    return gulp.src('src/posts/**/*.md')
               .pipe(plugins.frontMatter({property: 'page', remove: true}))
               .pipe(plugins.data({site: site}))
               .pipe(plugins.markdown())
               .pipe(collectPosts())
               .pipe(plugins.wrap(function(data) {
                 return fs.readFileSync("src/templates/post.html").toString();
               }, null, {engine: 'nunjucks'}))
               .pipe(gulp.dest('dist/blog'))
               .pipe(reload({stream: true}));
  });

  gulp.task('images', function() {
    return gulp.src('src/img/**/*')
              .pipe(plugins.imagemin())
              .pipe(gulp.dest('dist/img'))
              .pipe(reload({stream: true}));
  });

  gulp.task('static', function() {
    return gulp.src('src/static/**/*')
              .pipe(gulp.dest('dist'));
  });

  gulp.task('scripts', function() {
    return gulp.src('src/js/*')
              .pipe(plugins.uglify())
              .pipe(gulp.dest('dist/js'))
              .pipe(reload({stream: true}));
  });

  gulp.task('styles', function() {
    return gulp.src('src/sass/**/*.scss')
              .pipe(plugins.sass({outputStyle: 'compressed'}).on('error', plugins.sass.logError))
              .pipe(plugins.concat('all.min.css'))
              .pipe(gulp.dest('dist/css'))
              .pipe(reload({stream: true}));
  });

  gulp.task('sync', function() {
    return bSync({server: { baseDir: 'dist' }});
  });

  gulp.task('serve', function(cb) {
    return plugins.sequence('sync', cb);
  });

  gulp.task('assets', ['images', 'styles', 'scripts']);

  gulp.task('content', function(cb) {
    return plugins.sequence('static', 'posts', 'pages', cb);
  });

  gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
               .pipe(plugins.ghPages({}));
  });

  gulp.task('watch', function() {
    gulp.watch('src/js/**/*.js',          [ 'scripts']);
    gulp.watch('src/sass/**/*.scss',      [ 'styles']);
    gulp.watch('src/img/**/*',            [ 'images']);
    gulp.watch('src/posts/**/*.md',       [ 'content']);
    gulp.watch('src/pages/**/*.html',     [ 'pages']);
    gulp.watch('src/templates/**/*.html', [ 'content']);
  });

  gulp.task('default', plugins.sequence(['assets', 'content'], 'serve', 'watch'));
})();
