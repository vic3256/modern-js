var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// including in the vendor does not execute the script,
// but it is going to separate the pakages in the vendor js
const vendorModules = ['jquery','lodash', 'socket.io-client', 'rxjs', 'moment', 'moment-duration-format'];

// not using __dirname in this file because of an oddity when using webpack hot middleware on the server
// to provide our build assets for end development. Oddity of how __dirname gets compiled by webpack
// this is a workaround where I can resolve the absolute directory to the root path
// this does not apply when webpack is invoked by gulp or command line only when invoking by the server
const dirname = path.resolve('./');
function createConfig(isDebug) {

	// use eval-source-map for development - super fast
	// use source-map for production - slower but production ready
	const devtool = isDebug ? 'eval-source-map' : 'source-map';
	const plugins = [new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')];

	// combine loaders with '!' (creating pipeline right to left)
	const cssLoader = {test: /\.css$/, loader: 'style!css'};
	const sassLoader = {test: /\.scss$/, loader: 'style!css!sass'};
	const appEntry = ['./src/client/application.js'];

	if(!isDebug) {
		plugins.push(new webpack.optimize.UglifyJsPlugin());
		plugins.push(new ExtractTextPlugin('[name].css'));

		// extract css into text
		cssLoader.loader = ExtractTextPlugin.extract('style', 'css');
		sassLoader.loader = ExtractTextPlugin.extract('style', 'css!sass');
	} else {
		plugins.push(new webpack.HotModuleReplacementPlugin());
		appEntry.splice(0,0, 'webpack-hot-middleware/client');
	}

	return {
		devtool: devtool,
		// pass object to have multiple entry files
		entry: {
			application: appEntry,
			// separate vendor modules
			vendor: vendorModules
		},
		output: {
			path: path.join(dirname, 'public', 'build'),
			// use template string since passing multiple files
			filename: '[name].js',
			publicPath: '/build/'
		},
		resolve: {
			alias: {
				shared: path.join(dirname, 'src', 'shared')
			}
		},
		module: {
			loaders: [
				{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
				{ test: /\.js$/, loader: 'eslint', exclude: /node_modules/ },
				// if find any of these extensions use the url loader - limit 512b
				// allow us to load these as straight up files or url encoded files right into css
				{ test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=100' },
				cssLoader,
				sassLoader
			]
		},
		plugins: plugins
	};

}

module.exports = createConfig(true);
module.exports.create = createConfig;