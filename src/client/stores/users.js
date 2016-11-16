import _ from 'lodash';
import {Observable} from 'rxjs';
import {validateLogin} from 'shared/validation/users';

export class UsersStore {
	constructor(server) {
		this._server = server;

		// Users List
		const dafeaultStore = {users: []};
		const events$ = Observable.merge(
			// map to pertaining opeation
			this._server.on$('users:list').map(opList),
			this._server.on$('users:added').map(opAdd));

		this.state$ = events$
			// scan - reduce for observable - take the last iteam and current operation
			.scan(function (last, op) {
				return op(last.state);
			}, {state: dafeaultStore})
			.publishReplay(1);

		this.state$.connect();

		// Bootstrap
		this._server.on('connect', () => {
			this._server.emit('users:list');
		});
	}

	login$(name) {
		const validator = validateLogin(name);
		if(validator.hasErrors) {
			return Observable.throw({message: 'validator.message'});
		}
		return this._server.emitAction$('auth:login', {name});
	}
}


function opList(users) {
	return state => {
		state.users = users;
		state.users.sort((l,r) => l.name.localeCompare(r.name));
		return {
			type: 'list',
			state: state
		};
	};
}

// return function that mutates the state
function opAdd(user) {
	return state => {
		let insertIndex = _.findIndex(state.users,
			u => u.name.localeCompare(user.name) > 0);

		if(insertIndex === -1)
			insertIndex = state.users.length;

		state.users.splice(insertIndex, 0, user);
		return {
			type: 'add',
			user: user,
			state: state
		};
	};
}