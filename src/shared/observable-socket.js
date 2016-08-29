import {Observable} from 'rxjs';

export class ObservableSocket {

	get isConnected() { return this._state.isConnected; }
	get isReconnecting() { return this._state.isReconnecting; }
	get isTotallyDead() { return !this.isConnected && !this.isReconnecting; }

	constructor(socket) {
		this._socket = socket;
		this._state = {};

		this.status$ = Observable.merge(
			// observable event hendlers on socket.io
			// merging multiple Observable sequences into one with map -> map to new state object
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

	emitAction$(action, arg) {
		return Observable.empty();
	}

	onAction(action, callback) {
		
	}
}