import $ from 'jquery';

export class ComponentBase {

	attach($mount) {
		// jquery object prefixed with '$'
		this.$mount = $mount;
		this._onDetachHandlers = [];
		this.children = [];
		this._onAttach();
	}

	detach() {
		this._onDetach();

		for(let handler of this._onDetachHandlers)
			handler();

		for(let child of this.children)
			child.detach();

		this._onDetachHandlers = [];
		this.children = [];
	}

	_onAttach() {

	}

	_onDetach() {

	}
 
}

// inherit from base class
export class ElementComponent extends ComponentBase {
	get $element() { return this._$element; }

	// create element type, default to div
	constructor(elementType = 'div') {
		super();
		this._$element = $(`<${elementType}>`).data('component', this);
	}

	// attaches component instance to new element
	attach($mount) {
		// base method
		super.attach($mount);
		// attach element to mount node
		this.$element.appendTo(this._$mount);
	}

	// remove element from dom
	detach() {
		super.detach();
		this.$element.remove();
	}

	// helper class 
	_setClass(className, isOn) {
		if(isOn)
			this._$element.addClass(className);
		else
			this._$element.removeClass(className);
	}
}