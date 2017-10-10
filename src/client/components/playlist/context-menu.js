import $ from "jquery";
import {Subject, Observable} from "rxjs";

import {ElementComponent} from '../../lib/component';

export class PlaylistContextMenuComponent extends ElementComponent {
	constructor(playlistStore, usersStore, $list) {
		super('div');
		this.$element.addClass('context-menu');

		this._playlist = playlistStore;
		this._users = usersStore;
		this._$list = $list;
	}

	_onAttach() {

		const $playButton = $(`
			<a href="#" class="play">
				<i class="fa fa-play-circle" /> Play
			</a>
		`).appendTo(this.$element);

		const $deleteButton = $(`
			<a href="#" class="delete">
				<i class="fa fa-trash" /> Delete
			</a>
		`).appendTo(this.$element);

		const selectedItemSubject$ = new Subject();

		// creating context menu event handler. This happens when right clicking on menu element. Then looks up the closes li and extracting the data component. All individual <li>'s are element components. Element components automatically add a data element called component pointing to the component instance that the element is being controlled from.
		const openMenuOnItem$ = Observable.fromEventNoDefault(this._$list, "contextmenu")
			.map(event => $(event.target).closest("li").data("component"));

		const closeMenu$ = Observable.fromEvent($("body"), "mouseup")
			.filter(event => $(event.target).closest("li.selected, .context-menu").length == 0)
			.mapTo(null);

		// merge into one stream
		// when subscribed to this stream you get the currently selected item and if that item changes or not
		const selectedItem$ = Observable.merge(openMenuOnItem$, closeMenu$, selectedItemSubject$)
			.filter(() => this._users.isLoggedIn)
			.share();

		let lastItem = null;
		selectedItem$
			.compSubscribe(this, item => {
				if(lastItem) {
					lastItem.isSelected = false;
				}

				lastItem = item;

				if(!item) {
					this.$element.removeClass("open");
					lastItem = null;
					return;
				}

				item.isSelected = true;
				this.$element.addClass("open");

				const contextMenuHeight = this.$element.outerHeight();
				const itemHeight = item.$element.outerHeight();
				const itemPosition = item.$element[0].offsetTop;

				const targetPosition = itemPosition + itemHeight + contextMenuHeight > this._$list[0].scrollHeight 
					? itemPosition - contextMenuHeight
					: itemPosition + itemHeight;

				this.$element.css("top", targetPosition);
			});

		// mapping the fromEventNoDefault click to a function that returns a function
		const setCurrentItem$ = Observable.fromEventNoDefault($playButton, "click")
			.map(() => comp => this._playlist.setCurrentSource$(comp.source));

		const deleteSource$ = Observable.fromEventNoDefault($deleteButton, "click")
			.map(() => comp => this._playlist.deleteSource$(comp.source));

		// this is what the above functions look like using function closure syntax
		// const deleteSource$ = Observable.fromEventNoDefault($deleteButton, "click")
		// 	.map(function () {
		// 		return function (comp) {
		// 			return this._playlist.deleteSource$(comp.source);
		// 		};
		// 	});

		// pass mapped functions here - This makes is very simple to combine multiple buttons that do different things into a simple stream
		Observable.merge(setCurrentItem$, deleteSource$)
			// grabs latest selected item
			.withLatestFrom(selectedItem$)
			// op is the function we are passing, item is the latest selected Observable grabbed from array (.withLatestFrom)
			// op function is then invoked with the current item - then expected to return observable sequence which is caught by catchWrap to catch any exceptions
			.flatMap(([op, item]) => op(item).catchWrap())
			// subscribe
			.compSubscribe(this, response => {
				if(response && response.error) {
					alert(response.error.message || "Unknown Error");
				} else {
					selectedItemSubject$.next(null);
				}
			});
	}
}