'use strict';

const _ = require('lodash');
const del = require('del');
const gulp = require('gulp');
const argv = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const browserSync = require('browser-sync');
const htmlcompress = require('gulp-minify-html');
const gutil = require('gulp-util');
const gif = require('gulp-if');
// const filelog = require('gulp-filelog');  // NOTE: Used for debug
const runSequence = require('run-sequence');
const zip = require('gulp-zip');
const mocha = require('gulp-mocha');
const path = require('path');
const walk = require('walk');
const execSync = require('child_process').execSync;

const settings = {
    index: __dirname + '/src/index.html',
    entry: __dirname + '/src/index.js',
    output: __dirname + '/dist',
    server: __dirname + '/dist',
    assets: __dirname + '/assets/**/*'
};

const testSettings = {
    input: path.join(__dirname, 'test'),
    output: path.join(__dirname, 'dist-test'),
    testSuffix: /\.spec\.ts$/
};

let WATCH = !!argv.watch;
let RELEASE = !!argv.release;
const DEBUG = !!argv.debug;

function getBundleConfig() {
    const config = _.defaultsDeep({}, require('./webpack.config'));

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
    const files = [];
    const walker = walk.walk(testSettings.input, { followLinks: false });

    walker.on('file', (root, stat, next) => {
        if (stat.name.match(testSettings.testSuffix)) {
            files.push(path.join(root, stat.name));
        }
        next();
    });

    walker.on('end', () => {
        cb(files);
    });
}

gulp.task('bundle', (cb) => {
    let started = false;
    const config = getBundleConfig();
    function processResult(err, stats) {
        if (err) {
            return cb(err);
        }
        
        gutil.log('Webpack\n' + stats.toString(config.log));

        if (stats.hasErrors()) {
            return cb(new Error('Webpack completed with errors.'))
        }

        if (config.watch) {
            browserSync.reload(settings.entry);
        }

        if (!started) {
            started = true;
            cb();
        }
    }

    const compiler = webpack(config);
    if (config.watch) {
        compiler.watch(200, processResult);
    } else {
        compiler.run(processResult);
    }

});

gulp.task('pages', () => {
    return gulp.src(settings.index)
        .pipe(gif(RELEASE, htmlcompress()))
        .pipe(gulp.dest(settings.output))
        .pipe(gif(WATCH, browserSync.reload({ stream: true })));
});

gulp.task('assets', () => {
    return gulp.src(settings.assets)
        .pipe(gulp.dest(settings.output + '/assets'))
        .pipe(gif(WATCH, browserSync.reload({ stream: true })));
});

gulp.task('clean', () => {
    return del(settings.server + '/**');
});

gulp.task('clean-test', () => {
    return del(testSettings.output+ '/**');
});

// NOTE: was running in parallel but don't like the output
//gulp.task('build', ['pages', 'bundle']);
gulp.task('build', (cb) => {
    runSequence('pages', 'assets', 'bundle', cb);
});

gulp.task('build-dev', (cb) => {
    RELEASE = false;

    runSequence('build', cb);
});

gulp.task('build-prod', (cb) => {
    RELEASE = true;

    runSequence('build', cb);
});

gulp.task('build-ci', ['clean'], (cb) => {
    RELEASE = false;

    runSequence('build', cb);
});

gulp.task('build-test', (cb) => {
    getTests((tests) => {
        const config = _.defaultsDeep({}, require('./webpack.config'));
        const pathPrefix = path.join(testSettings.input, path.sep);

        config.entry = {};
        tests.forEach(function collectTest(test) {
            // strip out the prefix from the full path name
            let pathName = test.replace(pathPrefix, '');

            // strip out the suffix of the file name
            pathName = pathName.replace(testSettings.testSuffix, '');

            // the key in the entry determines the target folder structure of the test file
            config.entry[pathName] = test;
        });

        config.output.path = testSettings.output;

        let started = false;
        function processResult(err, stats) {
            gutil.log('Webpack\n' + stats.toString(config.log));

            if (!started) {
                started = true;
                cb();
            }
        }

        const compiler = webpack(config);
        compiler.run(processResult);
    });
});

gulp.task('test', ['clean-test', 'build-test'], () => {
    return gulp.src([testSettings.output + '/**/*.js'])
        .pipe(mocha())
});

gulp.task('server', (cb) => {
    browserSync({
        server: {
            baseDir: [settings.server]
        }
    });

    cb();
});

gulp.task('dev', (cb) => {
    WATCH = true;

    runSequence('build-dev', 'server', cb);
});

gulp.task('prod', (cb) => {
    WATCH = true;

    runSequence('build-prod', 'server', cb);
});

gulp.task('ci', ['build-ci'], () => {
    return gulp.src(['dist/**', '!dist/client.zip'])
        .pipe(zip('client.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('update-deps', (cb) => {
    del(path.join(__dirname, 'npm-shrinkwrap.json')).then(() => {
        execSync('npm update', {
            cwd: __dirname,
            stdio: 'inherit'
        });
        execSync('npm shrinkwrap', {
            cwd: __dirname,
            stdio: 'inherit'
        });
        execSync('npm outdated', {
            cwd: __dirname,
            stdio: 'inherit'
        });
    });
});

gulp.task('default', ['dev']);
