import $ from 'jquery';
import {ComponentBase} from '../../lib/component';

import './chat.scss';

// chat has two element sub components: chat list & chat form (not root level components)
import {ChatListComponent} from './list';
import {ChatFormComponent} from './form';


class ChatComponent extends ComponentBase {
	constructor() {
		super();
	}

	_onAttach() {
		const $title = this._$mount.find('> h1');
		$title.text('');

		const list = new ChatListComponent();
		list.attach(this._$mount);
		this.children.push(list);

		const form = new ChatFormComponent();
		form.attach(this._$mount);
		this.children.push(list);
	}
}

// hot reload
let component;
try {
	component = new ChatComponent();
	component.attach($('section.chat'));
}
catch (e) {
	console.error(e);
	if(component)
		component.detach();
}
finally {
	if(module.hot) {
		module.hot.accept();
		module.hot.dispose(() => component && component.detach());
	}
}