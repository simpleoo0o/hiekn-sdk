'use strict';

var gulp = require('gulp');
var gulpLess = require('gulp-less');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var license = require('gulp-licenser');

var lib = 'lib/';
var src = 'src/';
var dst = 'dist/';
var jsFile = 'hiekn-sdk.min.js';
var jsDevFile = 'hiekn-sdk.js';
var cssFile = 'hiekn-sdk.min.css';
var cssDevFile = 'hiekn-sdk.css';
var LICENSE_TEMPLATE =
    '/**\n\
     * @author: \n\
     *    jiangrun002\n\
     * @version: \n\
     *    v0.3.0\n\
     * @license:\n\
     *    Copyright 2017, jiangrun. All rights reserved.\n\
     */';

gulp.task('clean-js', function (cb) {
    return del(dst + '**/*.js', cb);
});

gulp.task('concat-js', function () {
    return gulp.src([
        src + '**/*.js'
    ]).pipe(concat(jsDevFile)).pipe(gulp.dest(dst));
});

gulp.task('concat-uglify-js', ['concat-js'], function () {
    return gulp.src([
        dst + '/' + jsDevFile
    ]).pipe(concat(jsFile)).pipe(uglify()).pipe(gulp.dest(dst));
});

gulp.task('clean-css', function (cb) {
    return del(src + '**/*.css', cb);
});

gulp.task('compile-less', ['clean-css'], function () {
    return gulp.src(src + '**/*.less')
        .pipe(gulpLess())
        .pipe(gulp.dest(src));
});

gulp.task('concat-css', ['compile-less'], function () {
    return gulp.src(src + '**/*.css').pipe(concat(cssDevFile)).pipe(gulp.dest(dst));
});

gulp.task('minify-css', ['concat-css'], function () {
    return gulp.src(dst + '/' + cssDevFile).pipe(concat(cssFile)).pipe(cleanCss({compatibility: 'ie8'})).pipe(gulp.dest(dst));
});

gulp.task('main-bower-file', function () {
    return gulp.src(mainBowerFiles({
        'overrides': {
            'hieknjs': {
                'main': [
                    'dist/jquery.hieknjs.min.js',
                    'dist/jquery.hieknjs.min.css'
                ]
            },
            'hiekn-prompt': {
                'main': [
                    'dist/hiekn-prompt.min.css',
                    'dist/hiekn-prompt.min.js'
                ]
            },
            'tgc2': {
                'main': [
                    'dist/tgc2.min.css',
                    'dist/tgc2.min.js'
                ]
            }
        }
    }))
        .pipe(gulp.dest(lib))
});

gulp.task('lib', ['main-bower-file'], function () {
    return gulp.src([lib + 'FontAwesome.otf', lib + 'fontawesome-webfont.*']).pipe(gulp.dest('fonts/'));
});

gulp.task('build', ['concat-uglify-js', 'minify-css'], function () {
    gulp.src([dst + '**/*.js', dst + '**/*.css'])
        .pipe(license(LICENSE_TEMPLATE))
        .pipe(gulp.dest(dst));
});

gulp.task('watch', function () {
    gulp.watch([src + '**/*.less'], ['minify-css']);
    gulp.watch([src + '**/*.js'], ['concat-uglify-js']);
});

gulp.task('default', ['build']);