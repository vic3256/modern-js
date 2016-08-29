import './application.scss';

// take all the exports from that module with '*'
import * as services from './services';

//============================= Testing
// emit and action - with action name ('login') and an object
// receive back an observable sequence I can subscribe to
services.server.emitAction$('login', {username: 'foo', password: 'bar'})
	.subscribe(result => {
		if(result.error)
			console.error(result.error);
		else
			console.log('Logged In!');
	});
//============================= Auth

//============================= Components

//============================= Bootstrap
services.socket.connect();