import 'source-map-support/register';

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import chalk from 'chalk';

import {ObservableSocket} from 'shared/observable-socket';

// determine if in development - extract node env variable (NODE_ENV) and set to isDevelopment
const isDevelopment = process.env.NODE_ENV !== 'production';

//============================= setup
const app = express();
const server = new http.Server(app);
const io = socketIo(server);


//============================= client webpack
if(process.env.USE_WEBPACK === 'true') {
	var webpackMiddleware = require('webpack-dev-middleware');
	var webpackHotMiddleware = require('webpack-hot-middleware');
	var webpack = require('webpack');
	var clientConfig = require('../../webpack.client');

	const compiler = webpack(clientConfig);
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
	console.log(chalk.bgRed('Using WebPack Dev Middleware! THIS IS FOR DEV ONLY!'));
}

//============================= configure express
// set view engine
app.set('view engine', 'jade');

// server static middlewared
app.use(express.static('public'));

// tell view to include link to css file or not
// when in production reference the extracted css file
// when in development use the webpack hot middleware
const useExternalStyles = !isDevelopment;
app.get('/', (req, res) => {
	res.render('index', {
		useExternalStyles
	});
});

//============================= modules

//============================= socket
io.on('connection', socket => {
	console.log(`Got connection from ${socket.request.connection.remoteAddress}`);

	const client = new ObservableSocket(socket);
	client.onAction('login', creds => {
		return database
			.find$('user', {username: creds.username})
			.flatmap(user => {
				if(!user || user.password != creds.password)
					return Observable.trow('User not found.');

				return Observable.of(user);
			});
	});
});

//============================= startup
const port = process.env.PORT || 3000;

function startServer() {
	server.listen(port, () => {
		console.log(`Started http server on ${port}`);
	});
}

startServer();