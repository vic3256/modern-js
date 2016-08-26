var path = require('path');


// not using __dirname in this file because of an oddity when using webpack hot middlewareon the server
// to provide our build assets for end development. Oddity of how __dirname gets compiled by webpack
// this is a workaround where I can resolve the absolute directory to the root path
// this does not apply when webpack is invoked by gulp or command line only when invoking by the server
const dirname = path.resolve('./');
function createConfig(isDebug) {

	// use eval-source-map for development - super fast
	// use source-map for production - slower but production ready
	const devTool = isDebug ? 'eval-source-map' : 'source-map';
	const plugins = [];

	// combine loaders with '!' (creating pipeline right to left)
	const cssLoader = {test: /\.css$/, loader: 'style!css'};
	const sassLoader = {test: /\.scss$/, loader: 'style!css!sass'};
	const appEntry = ['./src/client/application.js'];

	return {
		devTool: devTool,
		// pass object to have multiple entry files
		entry: {
			application: appEntry
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
		loaders: [
			{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
			{ test: /\.js$/, loader: 'eslint', exclude: /node_modules/ },
			// if find any of these extensions use the url loader - limit 512b
			// allow us to load these as straight up files or url encoded files
			{ test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=512' },
			cssLoader,
			sassLoader
		]
	};

}

module.exports = createConfig(true);
module.exports.create = createConfig;