var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var path        = require('./main-config');
var Iconv  		= require('iconv').Iconv;
var iconvLite = require('iconv-lite');
var encoding 	= require("encoding");

var iconv = new Iconv('windows-1251', 'UTF-8');


// Static Server + watching scss/html files
gulp.task('serve', function(){
	browserSync.init({
		proxy: {
			target: path.proxy,
			proxyRes: [
				function(proxyRes, req, res) {
					if( proxyRes.headers && proxyRes.headers["content-type"] &&
						proxyRes.headers["content-type"].match("text/html") ) {

						const _end = res.end
						const _writeHead = res.writeHead
						let writeHeadArgs
						let buffer = new Buffer("")
						proxyRes.headers['content-type'] = 'text/html; charset=utf-8';
						proxyRes.on("data", (chunk) => {
							buffer = Buffer.concat([buffer, chunk])
						})

						res.write = () => {};
						res.writeHead = (...args) => {writeHeadArgs = args}

						res.end = () => {
							_writeHead.apply(res, writeHeadArgs)
							_end.call(res, iconvLite.decode(buffer, "windows-1251"))
						}
					}
				}
			]
		},
		// https: true,
		// port: 9000,
		serveStatic: ["dist"],
		files: "dist/css/style.css",
		snippetOptions: {
			rule: {
				match: /<\/head>/i,
				fn: function (snippet, match) {
					return '<link rel="stylesheet" type="text/css" href="/css/style.css"/>' + snippet + match;
				}
			}
		},
		rewriteRules: [

		],
		open: false
	});
	gulp.watch(path.src.styles + "*.scss", ['sass']);
});


// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
	return gulp.src(path.src.styles + "*.scss")
		.pipe(sass())
		.pipe(gulp.dest(path.dist.styles))
		.pipe(browserSync.stream());
});

gulp.task('default', ['serve']);