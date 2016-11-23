// importing but not capturing variables, executing file which adds itself to the Observable prototype
import $ from "jquery";

import 'shared/operators';

import './application.scss';

// take all the exports from that module with '*'
import * as services from './services';

//============================= Testing
// emit and action - with action name ('login') and an object
// receive back an observable sequence I can subscribe to
services.server.emitAction$('login', {username: 'foo', password: 'bar'})
	.subscribe(user => {
		console.log('Logged in: ' + user);
	}, error => {
		console.error(error);
	});
//============================= Auth
const $html = $('html');
services.usersStore.currentUser$.subscribe(user => {
	if(user.isLoggedIn) {
		$html.removeClass('not-logged-in');
		$html.addClass('logged-in');
	} else {
		$html.addClass('not-logged-in');
		$html.removeClass('logged-in');
	}
});

//============================= Components
require('./components/player/player');
require('./components/users/users');
require('./components/chat/chat');
require('./components/playlist/playlist');

//============================= Bootstrap
services.socket.connect();

// services.usersStore.login$('whoa')
// 	.subscribe(user => {console.log(user);});

// window.setTimeout(() => {
// 	services.usersStore.logout$();
// }, 3000);