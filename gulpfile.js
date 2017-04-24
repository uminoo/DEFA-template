'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    svgo = require('gulp-svgo'),
    svgSprite = require('gulp-svg-sprite'),
    less = require('gulp-less'),
    favicons = require('gulp-favicons'),
    imagemin = require('gulp-imagemin'),
    fontgen = require('gulp-fontgen'),
    pug = require('gulp-pug2'),
    prettify = require('gulp-html-prettify'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    clean = require('gulp-clean');

//on error

function log(error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------".bold.red.underline,
        ("[" + error.name + " in " + error.plugin + "]").red.bold.inverse,
        error.message,
        "----------ERROR MESSAGE END----------".bold.red.underline,
        ''
    ].join('\n'));
    this.end();
}

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
        .pipe(favicons({
            appName: '',
            appDescription: '',
            background: "#fff",
            path: '',
            url: '',
            display: "standalone",
            orientation: "portrait",
            version: 1.0
        })).on('error', log)
        .pipe(gulp.dest('public/favicon'));
});

//font generator

gulp.task('fontgen', function() {
    return gulp.src("src/fonts/*.{ttf,otf}")
    .pipe(fontgen({
        dest: 'public/fonts'
    })).on('error', log)
});


//svg-sprite & optimazer

gulp.task('svg-sprite', function () {
    return gulp.src('src/icons/*.svg')
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
        })).on('error', log)
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
        })).on('error', log)
        .pipe(gulp.dest('public/icons'))
});

//build-less & autoprefixer

gulp.task('build-less', function () {
    return gulp.src('src/less/**/*.less')
        .pipe(gulp.dest('public/style'))
});

//compile less

gulp.task('compile-less', function (done) {
    return gulp.src('public/style/*.less')
        .pipe(less()).on('error', log)
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari >= 5', 'firefox >= 20', 'ie >= 9', 'opera >= 12', 'ios >= 6', 'android >= 4'],
            cascade: false
        })).on('error', log)
        .pipe(gulp.dest('public/style'))
});

//build-script

gulp.task('build-script', function () {
    return gulp.src('src/script/**/*.js')
        .pipe(gulp.dest('public/script'))
});

//build-html

gulp.task('build-html', function() {
    return gulp.src('src/pug/*.pug')
        .pipe(pug({
            pretty: true
        })).on('error', log)
        .pipe(prettify({indent_char: ' ', indent_size: 4})).on('error', log)
        .pipe(gulp.dest('public'))
})

//build-images & optimaze

gulp.task('build-images', function () {
    return gulp.src('src/images/**/*.*')
        .pipe(imagemin()).on('error', log)
        .pipe(gulp.dest('public/images'))
});

//build-upload

gulp.task('build-upload', function () {
    return gulp.src('src/upload/**/*.*')
        .pipe(imagemin()).on('error', log)
        .pipe(gulp.dest('public/upload'))
});

// watch -----------------------------

//watch-less

gulp.task('watch-less', function () {
    gulp.watch('src/less/**/*.less', function (event, cb) {
        runSequence('build-less', 'compile-less', function() {
            browserSync.reload();
        })
    });
});

//watch-html

gulp.task('watch-html', function () {
    gulp.watch('src/pug/**/*.pug', function (event, cb) {
        runSequence('build-html', function() {
            browserSync.reload();
        })
    });
});

//watch-sript

gulp.task('watch-script', function () {
    gulp.watch('src/script/**/*.js', function (event, cb) {
        runSequence('build-script', function() {
            browserSync.reload();
        })
    });
});

//watch-images

gulp.task('watch-images', function () {
    gulp.watch('src/images/**/*.*', function (event, cb) {
        runSequence('build-images', function() {
            browserSync.reload();
        })
    });
});

//watch-upload

gulp.task('watch-upload', function () {
    gulp.watch('src/upload/**/*.*', function (event, cb) {
        runSequence('build-upload', function() {
            browserSync.reload();
        })
    });
});

//watch-icons

gulp.task('watch-icons', function () {
    gulp.watch('src/icons/*.svg', function (event, cb) {
        runSequence('svg-sprite', function() {
            browserSync.reload();
        })
    });
});

//common build

gulp.task('build', function(callback) {
    runSequence(
        'cleaner',
        'favicon',
        'fontgen',
        'svg-sprite',
        'build-less',
        'compile-less',
        'build-script',
        'build-html',
        'build-images',
        'build-upload',
        'watch-less',
        'watch-html',
        'watch-script',
        'watch-images',
        'watch-icons',
        'watch-upload',
        'browsersync'
    )
});

//default

gulp.task('default', ['build']);
