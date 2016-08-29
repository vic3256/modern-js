import $ from 'jquery';
import {ElementComponent} from '../../lib/component';

class PlayerComponent extends ElementComponent {
	constructor() {
		super();
	}

	_onAttach() {
		const $title = this.$mount.find('h1');
		$title.text('hot reload!!!!');
	}
}

// hot reload
let component;
try {
	let component = new PlayerComponent();
	component.attach($('section.player'));
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