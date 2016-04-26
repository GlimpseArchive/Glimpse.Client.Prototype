'use strict';

var _ = require('lodash');
var del = require('del');
var gulp = require('gulp');
var argv = require('minimist')(process.argv.slice(2));
var webpack = require('webpack');
var browserSync = require('browser-sync');
var htmlcompress = require('gulp-minify-html');
var gutil = require('gulp-util');
var gif = require('gulp-if');
// var filelog = require('gulp-filelog');  // NOTE: Used for debug
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var mocha = require('gulp-mocha');
var path = require('path');

var settings = {
    index: __dirname + '/src/index.html',
    entry: __dirname + '/src/index.js',
    output: __dirname + '/dist',
    server: __dirname + '/dist',
    assets: __dirname + '/assets/**/*'
};

var testSettings = {
    input: __dirname + '/test',
    output: __dirname + '/dist-test',
    testSuffix: '.spec.ts'
};

var WATCH = !!argv.watch;
var RELEASE = !!argv.release;
var DEBUG = !!argv.debug;

function getBundleConfig() {
    var config = _.defaultsDeep({}, require('./webpack.config'));

    config.entry = settings.entry;
    config.output.path = settings.output;

    if (WATCH) {
        // config.chunkModules = false;
        config.watch = true;
    }

    if (RELEASE) {
        config.plugins = config.plugins.concat(
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.OccurenceOrderPlugin()
        );
    } else {
        config.output.pathinfo = true;
    }

    if (!RELEASE || DEBUG) {
        config.devtool = '#inline-source-map';
    }

    return config;
}

function getTests(cb) {
    var walk = require('walk');
    var files = [];
    var walker = walk.walk(testSettings.input, { followLinks: false });

    walker.on('file', function(root, stat, next) {
        files.push(root + '/' + stat.name);
        next();
    });

    walker.on('end', function() {
        cb(files);
    });
}

gulp.task('bundle', function (cb) {
    var started = false;
    var config = getBundleConfig();
    function processResult(err, stats) {
        gutil.log('Webpack\n' + stats.toString(config.log));

        if (config.watch) {
            browserSync.reload(settings.entry);
        }

        if (!started) {
            started = true;
            cb();
        }
    }

    var compiler = webpack(config);
    if (config.watch) {
        compiler.watch(200, processResult);
    } else {
        compiler.run(processResult);
    }

});

gulp.task('pages', function () {
    return gulp.src(settings.index)
        .pipe(gif(RELEASE, htmlcompress()))
        .pipe(gulp.dest(settings.output))
        .pipe(gif(WATCH, browserSync.reload({ stream: true })));
});

gulp.task('assets', function () {
    return gulp.src(settings.assets)
        .pipe(gulp.dest(settings.output + '/assets'))
        .pipe(gif(WATCH, browserSync.reload({ stream: true })));
});

gulp.task('clean', function () {
    return del(settings.server + '/**');
});

gulp.task('clean-test', function () {
    return del(testSettings.output+ '/**');
});

// NOTE: was running in parallel but don't like the output
//gulp.task('build', ['pages', 'bundle']);
gulp.task('build', function (cb) {
    runSequence('pages', 'assets', 'bundle', cb);
});

gulp.task('build-dev', function (cb) {
    RELEASE = false;
    
    runSequence('build', cb);
});

gulp.task('build-prod', function (cb) {
    RELEASE = true;
    
    runSequence('build', cb);
});

gulp.task('build-ci', ['clean'], function (cb) {
    RELEASE = false;
    
    runSequence('build', cb);
});

gulp.task('build-test', function buildTest(cb) {
    var config = _.defaultsDeep({}, require('./webpack.config'));

    var pathPrefix = path.join(testSettings.input, '/');
    var re = new RegExp(testSettings.testSuffix + '$');

    getTests(function collectAllTests(tests) {
        config.entry = {};

        tests.forEach(function collectTest(test) {
            var fileName = path.basename(test, testSettings.testSuffix);
            var fileNameWithSuffix = path.basename(test);
            var pathName = test.replace(pathPrefix, '');
            pathName = pathName.replace(re, '');
            
            // the key in the entry determines the target folder structure of the test file
            config.entry[pathName] = test;
        });

        config.output.path = testSettings.output;

        var started = false;
        function processResult(err, stats) {
            gutil.log('Webpack\n' + stats.toString(config.log));

            if (!started) {
                started = true;
                cb();
            }
        }

        var compiler = webpack(config);
        compiler.run(processResult);
    });
});

gulp.task('test', ['clean-test', 'build-test'], function test() {
    return gulp.src([testSettings.output + '/**/*.js'])
        .pipe(mocha())
});

gulp.task('server', function (cb) {
    browserSync({
        server: {
            baseDir: [settings.server]
        }
    });

    cb();
});

gulp.task('dev', function (cb) {
    WATCH = true;

    runSequence('build-dev', 'server', cb);
});

gulp.task('prod', function (cb) {
    WATCH = true;

    runSequence('build-prod', 'server', cb);
});

gulp.task('ci', ['build-ci'], function () {
    return gulp.src(['dist/**', '!dist/client.zip'])
        .pipe(zip('client.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['dev']);
