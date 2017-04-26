const gulp = require('gulp');
const sass = require('gulp-sass');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const spritesmith = require('gulp.spritesmith-multi')
const merge = require('merge-stream')
const imagemin = require('gulp-imagemin')
const runSequence = require('run-sequence')
const del = require('del')
const watch = require('gulp-watch')
const concatCss = require('gulp-concat-css')
const browserSync = require('browser-sync').create();

const bases = {
    src: './src/',
    dist: './'
};
const paths = {
    js: bases.dist + 'js/apps/**/*.js',
    scss: bases.src + 'scss/**/*.scss',
    html: bases.dist + '**/*.html',
    images: bases.src + 'img/**/*.*'
};

gulp.task('html', function () {
    return gulp.src([paths.html, '!./node_modules/**/*.*'])
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-js', ['clean-min-js-files'], function () {
    return gulp.src(paths.js)
        .pipe(concat('project-name.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(bases.dist + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('sass', function () {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
            cascade: false
        }))
        .pipe(gulp.dest(bases.dist + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('minify-css', function () {
    gulp.src([bases.dist + 'css/**/*.css', '!./css/**/*.min.css'])
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(bases.dist + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('images', ['clean-img-folders'], function () {
    return gulp.src(bases.src + 'img/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest(bases.dist + 'img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('clean-img-folders', function () {
    return del(bases.dist + 'img/**/*.*');
});

gulp.task('clean-css-folders', function () {
    return del(bases.dist + 'css');
});

gulp.task('clean-min-js-files', function () {
    return del(bases.dist + 'js/*.min.js');
});

gulp.task('generate-sass', function () {
    runSequence('clean-css-folders', 'sass', 'minify-css');
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['minify-js']);
    gulp.watch(paths.images, ['images']);
    watch([paths.scss], function () {
        gulp.start('generate-sass');
    });
    gulp.watch(paths.html, ['html']);
});

gulp.task('init-dist-resources', function () {
    gulp.start('generate-sass');
    gulp.start('minify-js');
    gulp.start('images');
    gulp.start('html');
})

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: bases.dist
        }
    });
});

gulp.task('default', ['init-dist-resources', 'server', 'watch']);