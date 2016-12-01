import $ from 'jquery';
import {Observable} from 'rxjs';

import {ElementComponent} from '../../lib/component';

export class PlaylistToolbarComponent extends ElementComponent {
	constructor(playlistStore) {
		super('div');
		this._playlist = playlistStore;
		this.$element.addClass('toolbar');
	}

	_onAttach() {
		const $addButton =
			$(`<a href="#" class="add-button">
				<i class="fa fa-plus-square" /> next
			</a>`).appendTo(this.$element);

		Observable.fromEventNoDefault($addButton, 'click')
			.flatMap(() => Observable.fromPrompt('Enter the URL of the video'))
			.filter(url => url && url.trim().length)
			// catchWrap - if an error happens in this call it will not terminate the stream
			// but instead wrap the error in a result that we can the detect
			.flatMap(url => this._playlist.addSource$(url).catchWrap())
			.compSubscribe(this, result => {
				if(result && result.error) {
					alert(result.error.message || 'Unknown Error');
				}
			});
	}
}