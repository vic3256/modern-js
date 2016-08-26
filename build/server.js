/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);
	
	var _express = __webpack_require__(2);
	
	var _express2 = _interopRequireDefault(_express);
	
	var _http = __webpack_require__(3);
	
	var _http2 = _interopRequireDefault(_http);
	
	var _socket = __webpack_require__(4);
	
	var _socket2 = _interopRequireDefault(_socket);
	
	var _chalk = __webpack_require__(5);
	
	var _chalk2 = _interopRequireDefault(_chalk);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// determine if in development - extract node env variable (NODE_ENV) and set to isDevelopment
	var isDevelopment = process.env.NODE_ENV !== 'production';
	
	//============================= setup
	var app = (0, _express2.default)();
	var server = new _http2.default.Server(app);
	var io = (0, _socket2.default)(server);
	
	//============================= client webpack
	if (process.env.USE_WEBPACK === 'true') {
		var webpackMiddleware = __webpack_require__(6);
		var webpackHotMiddleware = __webpack_require__(7);
		var webpack = __webpack_require__(8);
		var clientConfig = __webpack_require__(9);
	
		var compiler = webpack(clientConfig);
		// pass compiler
		app.use(webpackMiddleware(compiler, {
			publicPath: '/build/',
			stats: {
				colors: true,
				chunks: false,
				assets: false,
				timings: false,
				modules: false,
				hash: false,
				version: false
			}
		}));
	
		// pass compiler
		app.use(webpackHotMiddleware(compiler));
		console.log(_chalk2.default.bgRed('Using WebPack Dev Middleware! THIS IS FOR DEV ONLY!'));
	}
	
	//============================= configure express
	// set view engine
	app.set('view engine', 'jade');
	
	// server static middlewared
	app.use(_express2.default.static('public'));
	
	// tell view to include link to css file or not
	// when in production reference the extracted css file
	// when in development use the webpack hot middleware
	var useExternalStyles = !isDevelopment;
	app.get('/', function (req, res) {
		res.render('index', {
			useExternalStyles: useExternalStyles
		});
	});
	
	//============================= modules
	
	//============================= socket
	io.on('connection', function (socket) {
		console.log('Got connection from ' + socket.request.connection.remoteAddress);
	});
	
	//============================= startup
	var port = process.env.PORT || 3000;
	
	function startServer() {
		server.listen(port, function () {
			console.log('Started http server on ' + port);
		});
	}
	
	startServer();

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("source-map-support/register");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("chalk");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("webpack-dev-middleware");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("webpack-hot-middleware");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("webpack");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var path = __webpack_require__(10);
	var webpack = __webpack_require__(8);
	var ExtractTextPlugin = __webpack_require__(11);
	
	var vendorModules = ['jquery', 'lodash'];
	
	// not using __dirname in this file because of an oddity when using webpack hot middlewareon the server
	// to provide our build assets for end development. Oddity of how __dirname gets compiled by webpack
	// this is a workaround where I can resolve the absolute directory to the root path
	// this does not apply when webpack is invoked by gulp or command line only when invoking by the server
	var dirname = path.resolve('./');
	function createConfig(isDebug) {
	
		// use eval-source-map for development - super fast
		// use source-map for production - slower but production ready
		var devtool = isDebug ? 'eval-source-map' : 'source-map';
		var plugins = [new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')];
	
		// combine loaders with '!' (creating pipeline right to left)
		var cssLoader = { test: /\.css$/, loader: 'style!css' };
		var sassLoader = { test: /\.scss$/, loader: 'style!css!sass' };
		var appEntry = ['./src/client/application.js'];
	
		if (!isDebug) {
			plugins.push(new webpack.optimize.UglifyJsPlugin());
			plugins.push(new ExtractTextPlugin('[name].css'));
	
			// extract css into text
			cssLoader.loader = ExtractTextPlugin.extract('style', 'css');
			sassLoader.loader = ExtractTextPlugin.extract('style', 'css!sass');
		} else {
			plugins.push(new webpack.HotModuleReplacementPlugin());
			appEntry.splice(0, 0, 'webpack-hot-middleware/client');
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
				loaders: [{ test: /\.js$/, loader: 'babel', exclude: /node_modules/ }, { test: /\.js$/, loader: 'eslint', exclude: /node_modules/ },
				// if find any of these extensions use the url loader - limit 512b
				// allow us to load these as straight up files or url encoded files right into css
				{ test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=100' }, cssLoader, sassLoader]
			},
			plugins: plugins
		};
	}
	
	module.exports = createConfig(true);
	module.exports.create = createConfig;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("extract-text-webpack-plugin");

/***/ }
/******/ ]);
//# sourceMappingURL=server.js.map