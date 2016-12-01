import {Observable} from 'rxjs';

export class YoutubeService {
	process$(url) {
		return Observable.of({
			title: `TEST - ${url}`,
			type: 'youtube',
			url: url,
			totalTime: 500
		}).delay(400);
	}
}