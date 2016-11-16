import {Observable, ReplaySubject} from 'rxjs';

export function clientMessage(message) {
	const error = new Error(message);
	error.clientMessage = message;
	return error;
}

export function fail(message) {
	return Observable.throw({clientMessage: message});
}

let successObservable = Observable.empty();
export function success() {
	return successObservable;
}

export class ObservableSocket {

	get isConnected() { return this._state.isConnected; }
	get isReconnecting() { return this._state.isReconnecting; }
	get isTotallyDead() { return !this.isConnected && !this.isReconnecting; }

	constructor(socket) {
		this._socket = socket;
		this._state = {};
		this._actionCallbacks = {};
		this._requests = {};
		this._nextRequestId = 0;

		this.status$ = Observable.merge(
			// observable event hendlers on socket.io
			// merging multiple Observable sequences into one with merge -> map to new state object
			this.on$('connect').map(() => ({ isConnected: true })),
			this.on$('disconnect').map(() => ({ isConnected: false })),
			this.on$('reconnecting').map(attempt => ({ isConnected: false, isReconnecting: true, attempt })),
			this.on$('reconnect_failed').map(() => ({ isConnected: false, isReconnecting: false })))
			// new person connecting to stream share the one instance of event handlers
			// but the second somebody subscribes always publish the latest event that came out
			.publishReplay(1)
			.refCount();

		this.status$.subscribe(state => this._state = state);
	}

	// basic wrappers
	on$(event) {
		// binding to whatever event in socket.io - receive event stream from socket.io
		return Observable.fromEvent(this._socket, event);
	}

	// basic on method - no event stream
	on(event, callback) {
		this._socket.on(event, callback);
	}

	off(event, callback) {
		this._socket.off(event, callback);
	}

	emit(event, arg) {
		this._socket.emit(event, arg);
	}

	//============================= Emit - client side
	emitAction$(action, arg) {
		const id = this._nextRequestId++;
		this._registerCallbacks(action);

		const subject = this._requests[id] = new ReplaySubject(1);
		this._socket.emit(action, arg, id);
		return subject;
	}

	// responsible for registering the success/failure callbacks on the socket
	// when server sends back a response do something with it
	_registerCallbacks(action) {
		if(this._actionCallbacks.hasOwnProperty(action))
			return;

		this._socket.on(action, (arg, id) => {
			const request = this._popRequest(id);
			if(!request) return;

			// 'request' methods are returned from rxjs Observable subjects returned from emitAction$
			request.next(arg);
			request.complete();
		});

		this._socket.on(`${action}:fail`, (arg, id) => {
			const request = this._popRequest(id);
			if(!request) return;

			request.error(arg);
		});

		this._actionCallbacks[action] = true;
	}

	// server sends response with unknown request id
	_popRequest(id) {
		// show error
		if(!this._requests.hasOwnProperty(id)) {
			console.error(`Event with ${id} was returned twice, or the server did not send back an ID!`);
			return;
		}

		// delete request id that was not initiated by server
		const request = this._requests[id];
		delete this._requests[id];
		return request;
	}

	//============================= On - server side
	onAction(action, callback) {
		this._socket.on(action, (arg, requestId) => {
			try {
				const value = callback(arg);
				// if no value tell the client request is complete, send null value and request id
				if(!value) {
					this._socket.emit(action, null, requestId);
					return;
				}

				if(typeof(value.subscribe) !== 'function') {
					this._socket.emit(action, value, requestId);
					return;
				}

				let hasValue = false;
				value.subscribe({
					next: (item) => {
						if(hasValue)
							throw new Error(`Action ${action} produced more than one value`);

						this._socket.emit(action, item, requestId);
						hasValue = true;
					},

					error: (error) => {
						this._emitError(action, requestId, error);
						console.error(error.stack || error);
					},

					complete: () => {
						if(!hasValue)
							this._socket.emit(action, null, requestId);
					}
				});
			}
			catch (error) {
				if(typeof(requestId) !== 'undefined')
					this._emitError(action, requestId, error);

				console.error(error.stack || error);
			}
		});
	}

	// register multiple actions with same object
	onActions(actions) {
		for(let action in actions) {
			if(!actions.hasOwnProperty(action))
				continue;

			this.onAction(action, actions[action]);
		}
	}

	_emitError(action, id, error) {
		const message = (error && error.clientMessage || 'Fatal Error');
		this._socket.emit(`${action}:fail`, {message}, id);
	}
}