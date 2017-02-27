'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    svgo = require('gulp-svgo'),
    svgSprite = require('gulp-svg-sprite'),
    less = require('gulp-less'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    favicons = require('gulp-favicons'),
    imagemin = require('gulp-imagemin'),
    fontgen = require('gulp-fontgen'),
    plumber = require('gulp-plumber'),
    pug = require('gulp-pug2'),
    prettify = require('gulp-html-prettify'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    clean = require('gulp-clean');

//browser-sync

gulp.task('browsersync', function() {
    browserSync({
        server: {
            baseDir: 'public'
        },
        notify: false
    })
});

//cleaner

gulp.task('cleaner', function() {
    return gulp.src('public')
        .pipe(clean({force: true}))
});

// favicons

gulp.task('favicon', function() {
    return gulp.src('src/favicon/*.png')
        .pipe(plumber())
        .pipe(favicons({
            appName: '',
            appDescription: '',
            background: "#fff",
            path: '',
            url: '',
            display: "standalone",
            orientation: "portrait",
            version: 1.0
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('public/favicon'));
});

//font generator

gulp.task('fontgen', function() {
    return gulp.src("src/fonts/*.{ttf,otf}")
    .pipe(plumber())
    .pipe(fontgen({
        dest: 'public/fonts'
    }))
    .pipe(plumber.stop())
});

//iconfont

var runTimestamp = Math.round(Date.now()/1000);

gulp.task('icon-font', function() {
    return gulp.src(['src/icons/font-icons/*.svg'])
    .pipe(gulp.dest('public/font-icons/data-icons'))
    .pipe(plumber())
    .pipe(iconfontCss({
      fontName: 'icons',
      path: 'src/assets/less/templates/icons.less',
      targetPath: '../less/include/icons.less',
      fontPath: '../fonts/'
    }))
    .pipe(iconfont({
        fontName: 'icons',
        prependUnicode: true,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        timestamp: runTimestamp,
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('public/font-icons'))
});

//svg-sprite & optimazer

gulp.task('svg-sprite', function () {
    return gulp.src('src/icons/*.svg')
        .pipe(plumber())
        .pipe(gulp.dest('public/icons/data-icons'))
        .pipe(svgo({
            plugins: [
                {removeTitle: true},
                {removeUselessDefs: true},
                {removeEmptyContainers: true},
                {removeXMLProcInst: true},
                {removeComments: true},
                {removeMetadata: true},
                {removeDesc: true},
                {removeXMLNS: true},
                {removeEditorsNSData: true},
                {removeEmptyAttrs: true},
                {removeHiddenElems: true},
                {convertTransform: true},
                {removeStyleElement: true}
            ]
        }))
        .pipe(replace('#000', 'currentColor'))
        .pipe(svgSprite({
            mode: 'symbols',
            preview: false,
            selector: "%f",
            mode: {
                symbol : {
                    dest: '',
                    sprite: 'sprite.svg',
                }
            },
            svg: {
                xmlDeclaration: false,
                doctypeDeclaration: false,
                namespaceIDs: false,
                dimensionAttributes: false
            }
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('public/icons'))
});


//compile less

gulp.task('compile-less', function () {
    return gulp.src('src/less/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(plumber.stop())
        .pipe(gulp.dest('public/style'))
});

//build-less & autoprefixer

gulp.task('build-less', function () {
    return gulp.src('src/less/**/*.less')
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari >= 5', 'firefox >= 20', 'ie >= 9', 'opera >= 12', 'ios >= 6', 'android >= 4'],
            cascade: false
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('public/style'))
        .pipe(browserSync.stream())
});

//build-script

gulp.task('build-script', function () {
    return gulp.src('src/script/**/*.js')
        .pipe(gulp.dest('public/script'))
        .pipe(browserSync.stream())
});

//build-html

gulp.task('build-html', function() {
    return gulp.src('src/pug/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(prettify({indent_char: ' ', indent_size: 4}))
        .pipe(plumber.stop())
        .pipe(gulp.dest('public'))
        .pipe(browserSync.stream())
})

//build-images & optimaze

gulp.task('build-images', function () {
  gulp.src('src/images/**/*.*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(plumber.stop())
    .pipe(gulp.dest('public/images'))
});

//build-upload

gulp.task('build-upload', function () {
    return gulp.src('src/upload/**/*.*')
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(plumber.stop())
        .pipe(gulp.dest('public/upload'))
});

// watch -----------------------------

//watch-less

gulp.task('watch-less', function () {
    gulp.watch('src/less/**/*.less', function (event, cb) {
        gulp.start('compile-less')
            .start('build-less')
    });
});

//watch-html

gulp.task('watch-html', function () {
    gulp.watch('src/pug/**/*.pug', function (event, cb) {
        gulp.start('build-html')
    });
});

//watch-sript

gulp.task('watch-script', function () {
    gulp.watch('src/script/**/*.js', function (event, cb) {
        gulp.start('build-script')
    });
});

//watch-images

gulp.task('watch-images', function () {
    gulp.watch('src/images/**/*.*', function (event, cb) {
        gulp.start('build-images')
    });
});

//watch-upload

gulp.task('watch-upload', function () {
    gulp.watch('src/upload/**/*.*', function (event, cb) {
        gulp.start('build-upload')
    });
});

//common build

gulp.task('build', function(callback) {
    runSequence(
        'cleaner',
        'favicon',
        'fontgen',
        'icon-font',
        'svg-sprite',
        'compile-less',
        'build-less',
        'build-script',
        'build-html',
        'build-images',
        'build-upload',
        'watch-less',
        'watch-html',
        'watch-script',
        'watch-images',
        'watch-upload',
        'browsersync'
    )
});

//default

gulp.task('default', ['build']);