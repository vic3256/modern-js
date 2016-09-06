import {ModuleBase} from '../lib/module';

export class ChatModule extends ModuleBase {
	constructor(io, userModule) {
		super();
		this._io = io;
		this._users = userModule;
	}
}