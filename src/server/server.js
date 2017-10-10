import 'source-map-support/register';

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import chalk from 'chalk';
import {Observable} from 'rxjs';

// importing but not capturing variables, executing file which adds itself to the Observable prototype
import 'shared/operators';
import {ObservableSocket} from 'shared/observable-socket';

import {FileRepository} from './repositories/file';
import {YoutubeService} from './services/youtube';

import {UsersModule} from './modules/users';
import {PlaylistModule} from './modules/playlist';
import {ChatModule} from './modules/chat';


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

//============================= services
// const videoServices = [new YoutubeService('AIzaSyDC__gQuBbznj19quQ0b9S-TYCLLlxWzcE')];
const videoServices = [new YoutubeService('AIzaSyDI9fsMRaRyM4spzn9T5P-_DtvY1Af3vQs')];
const playlistRepository = new FileRepository('./data/playlist.json');

//============================= modules
const users = new UsersModule(io);
const chat = new ChatModule(io, users);
const playlist = new PlaylistModule(io, users, playlistRepository, videoServices);

const modules = [users, chat, playlist];

//============================= socket
io.on('connection', socket => {
	console.log(`Got connection from ${socket.request.connection.remoteAddress}`);

	const client = new ObservableSocket(socket);

	// register client with all modules
	for(let mod of modules)
		mod.registerClient(client);

	// tell all the modules the client is registered
	for(let mod of modules)
		mod.clientRegistered(client);

});

//============================= startup
const port = process.env.PORT || 3000;

function startServer() {
	server.listen(port, () => {

		console.log(`Started http server on ${port}`);
	});
}

// Observable merge all initialization functions from all of the modules
Observable.merge(...modules.map(m => m.init$()))
	.subscribe({
		complete() {
			startServer();
		},

		error(error) {
			console.log(`Could not init module: ${error.stack || error}`);
		}
	});