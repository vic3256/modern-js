import gulp from 'gulp';
import webpack from 'webpack';
import chalk from 'chalk';
import rimraf from 'rimraf';
import {create as createServerConfig} from './webpack.server';
 
// this var will now have all the packages starting with 'gulp-'
// so you dont have to load all gulp plugins individually
// $.util === gulp-util, $.nodemon === gulp-nodemon, etc.
const $ = require('gulp-load-plugins')();


// public tasks
gulp.task('clean:server', cb => rimraf('./build', cb));
gulp.task('clean:client', cb => rimraf('./public/build', cb));
gulp.task('clean', gulp.parallel('clean:server', 'clean:client'));

gulp.task('dev:server', gulp.series('clean:server', devServerBuild));
gulp.task('dev', gulp.series('clean', devServerBuild, gulp.parallel(devServerWatch, devServerReload)));

gulp.task('prod:server', gulp.series('clean:server', prodServerBuild));


// private server tasks
const devServerWebpack = webpack(createServerConfig(true));

function devServerBuild(callback) {
	devServerWebpack.run((error, stats) => {
		outputWebpack('Dev:Server', error, stats);
		callback();
	});
}

function devServerWatch() {
	devServerWebpack.watch({}, (error, stats) => {
		outputWebpack('Dev:Server', error, stats);
	});
}

function devServerReload() {
	return $.nodemon({
		script: './build/server.js',
		watch: './build',
		env: {
			'NODE_ENV': 'development',
			'USE_WEBPACK': 'true'
		}
	});
}

function prodServerBuild(callback) {
	const prodServerWebpack = webpack(createServerConfig(false));
	prodServerWebpack.run((error, stats) => {
		outputWebpack('Prod:Server', error, stats);
		callback();
	})
}


// helpers
function outputWebpack(label, error, stats) {
	if(error) throw new Error(error);

	if(stats.hasErrors()) {
		$.util.log(chalk.inverse(stats.toString({ colors: true })));
	}else {
		const time = stats.endTime - stats.startTime;
		$.util.log(chalk.bgBlue(`Built ${label} in ${time} ms`));
	}
}