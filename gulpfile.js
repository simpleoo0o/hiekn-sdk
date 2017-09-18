'use strict';

var pkg = require('./package.json');
var pkgLock = require('./package-lock.json');
var tsconfig = require('./tsconfig.json');
var bowerFile = require('./bower.json');
var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var replace = require('gulp-replace');
var license = require('gulp-licenser');
var jsonfile = require('jsonfile');
var plumber = require('gulp-plumber');
var ts = require("gulp-typescript");
var watch = require('gulp-watch');
var merge = require('merge2');
var sourcemaps = require('gulp-sourcemaps');

var lib = 'lib/';
var src = 'src/';
var dst = 'dist/';
var jsFile = pkg.name + '.min.js';
var jsDevFile = pkg.name + '.js';
var tsDevFile = pkg.name + '.ts';
var cssFile = pkg.name + '.min.css';
var cssDevFile = pkg.name + '.css';
var lessDevFile = pkg.name + '-experimental.less';
var lessFile = pkg.name + '.less';
var LICENSE_TEMPLATE =
    '/**\n\
     * @author: \n\
     *    jiangrun002\n\
     * @version: \n\
     *    v' + pkg.version + '\n\
     * @license:\n\
     *    Copyright 2017, jiangrun. All rights reserved.\n\
     */';

gulp.task('clean-script', function (cb) {
    return del([dst + '**/*.js', dst + '**/*.js.map', dst + '**/*.ts'], cb);
});

gulp.task('concat-src', ['clean-script'], function () {
    return gulp.src([
        src + 'ts/netchart/netchart.ts',
        src + 'ts/netchart/*.ts',
        src + 'ts/stat/stat.ts',
        src + 'ts/stat/*.ts',
        src + 'ts/*.ts',
        src + 'ts/upgrade/*.ts'
    ]).pipe(concat(tsDevFile)).pipe(replace(/\/\/\/.*>/g, '')).pipe(gulp.dest(dst));
});

gulp.task('compile-ts', ['concat-src'], function () {
    var compilerOptions = tsconfig.compilerOptions;
    compilerOptions.sourceMap = true;
    compilerOptions.declaration = true;
    var tsProject = ts.createProject(compilerOptions);
    var tsResult = gulp.src([dst + tsDevFile, 'typings/*.d.ts']).pipe(sourcemaps.init()).pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest(dst)),
        tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest(dst)),
        tsResult.js.pipe(concat(jsFile)).pipe(uglify()).pipe(gulp.dest(dst))
    ]);
});

gulp.task('clean-style', function (cb) {
    return del([dst + '*.css', dst + '*.less'], cb);
});

gulp.task('concat-less', ['clean-style'], function () {
    return gulp.src(['!' + src + 'define.less', src + '**/*.less']).pipe(concat(lessFile)).pipe(replace(/@import .*;/g, '')).pipe(gulp.dest(dst));
});

gulp.task('concat-define', ['concat-less'], function () {
    return gulp.src([src + 'define.less', dst + lessFile]).pipe(concat(lessFile)).pipe(gulp.dest(dst));
});

gulp.task('compile-less', ['concat-less'], function () {
    gulp.src([dst + lessFile]).pipe(concat(lessDevFile)).pipe(gulp.dest(dst));
    return gulp.src(dst + lessFile)
        .pipe(less())
        .pipe(gulp.dest(dst));
});

gulp.task('minify-css', ['compile-less'], function () {
    return gulp.src(dst + cssDevFile).pipe(concat(cssFile)).pipe(cleanCss({compatibility: 'ie8'})).pipe(gulp.dest(dst));
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
                    'dist/tgc2.min.js',
                    'dist/tgc2.d.ts'
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
    pkgLock.version = pkg.version;
    jsonfile.writeFile('./package-lock.json', pkgLock);
    bowerFile.version = pkg.version;
    bowerFile.name = pkg.name;
    bowerFile.main = [
        dst + jsDevFile,
        dst + cssDevFile
    ];
    jsonfile.writeFile('./bower.json', bowerFile);
});

gulp.task('build', ['clean-src-gent', 'build-bower-file', 'compile-ts', 'minify-css'], function () {
    gulp.src([dst + '**/*.js', dst + '**/*.css'])
        .pipe(license(LICENSE_TEMPLATE))
        .pipe(gulp.dest(dst));
});

gulp.task('watch', function () {
});

gulp.task('default', ['build']);


gulp.task('clean-src-gent', function (cb) {
    return del([src + 'ts/**/*.js', src + 'ts/**/*.map', src + 'ts/**/*.d.ts', src + 'less/**/*.css'], cb);
});