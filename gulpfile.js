'use strict';

var pkg = require('./package.json');
var bowerFile = require('./bower.json');
var gulp = require('gulp');
var gulpLess = require('gulp-less');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var replace = require('gulp-replace');
var license = require('gulp-licenser');
var jsonfile = require('jsonfile');

var lib = 'lib/';
var src = 'src/';
var dst = 'dist/';
var jsFile = pkg.name + '.min.js';
var jsDevFile = pkg.name + '.js';
var cssFile = pkg.name + '.min.css';
var cssDevFile = pkg.name + '.css';
var lessDevFile = pkg.name + '-experimental.less';
var LICENSE_TEMPLATE =
    '/**\n\
     * @author: \n\
     *    jiangrun002\n\
     * @version: \n\
     *    v' + pkg.version + '\n\
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

gulp.task('concat-less', function () {
    return gulp.src(['' + src + 'define.less', src + '**/*.less']).pipe(concat(lessDevFile)).pipe(replace(/@import .*;/g, '')).pipe(gulp.dest(dst));
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

gulp.task('clean-lib', function (cb) {
    return del([lib + '**/*'], cb);
});

gulp.task('main-bower-file', ['clean-lib'], function () {
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
            },
            'bootstrap-datepicker': {
                'main': [
                    "dist/css/bootstrap-datepicker3.css",
                    "dist/js/bootstrap-datepicker.min.js"
                ]
            },
            'tooltipster': {
                'main': [
                    'dist/js/tooltipster.bundle.min.js',
                    'dist/css/tooltipster.bundle.min.css',
                    'dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css'
                ]
            },
            'moment': {
                'main': [
                    'min/moment.min.js'
                ]
            },
            'ztree_v3': {
                'main': [
                    'css/zTreeStyle/zTreeStyle.css',
                    'css/zTreeStyle/img/zTreeStandard.png',
                    'css/zTreeStyle/img/line_conn.gif',
                    'css/zTreeStyle/img/loading.gif',
                    'js/jquery.ztree.all.min.js'
                ]
            }
        }
    }))
        .pipe(gulp.dest(lib))
});

gulp.task('update-lib', ['main-bower-file'], function () {
    return gulp.src([lib + 'zTreeStandard.png', lib + 'line_conn.gif', lib + 'loading.gif']).pipe(gulp.dest(lib + 'zTreeStyle/'));
});

gulp.task('lib', ['update-lib'], function (cb) {
    return del([lib + 'zTreeStandard.png', lib + 'line_conn.gif', lib + 'loading.gif'], cb);
});

gulp.task('build-bower-file', function () {
    jsonfile.spaces = 2;
    bowerFile.version = pkg.version;
    bowerFile.name = pkg.name;
    bowerFile.main = [
        dst + jsDevFile,
        dst + cssDevFile
    ];
    jsonfile.writeFile('./bower.json', bowerFile);
});

gulp.task('build', ['build-bower-file', 'concat-uglify-js', 'minify-css', 'concat-less'], function () {
    gulp.src([dst + '**/*.js', dst + '**/*.css'])
        .pipe(license(LICENSE_TEMPLATE))
        .pipe(gulp.dest(dst));
});

gulp.task('watch', function () {
    gulp.watch([src + '**/*.less'], ['minify-css']);
    gulp.watch([src + '**/*.js'], ['concat-uglify-js']);
});

gulp.task('default', ['build']);