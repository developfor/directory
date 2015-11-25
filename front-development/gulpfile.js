var gulp = require('gulp');
var watchLess = require('gulp-watch-less');
var watch = require('gulp-watch');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var moment = require('moment');

gulp.task('default', function () {
	console.log("running")
	watch('./less/**/*.less', function () {
		console.log("new css made at: " + moment().format());
	   gulp.src('./less/style.less')
	        .pipe(less())
	        .pipe(minifyCSS())
	        .pipe(gulp.dest('./css'))
	        .pipe(gulp.dest('../public/app/css'));
	  	gulp.src('./less/style.less')
	        .pipe(less())
	        .pipe(minifyCSS())
	        .pipe(gulp.dest('./css'))
	        .pipe(gulp.dest('../public/app/css'));
	    return

    });
});