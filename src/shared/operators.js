import {Observable} from 'rxjs';

Observable.prototype.safeSubscribe = function(next, error, complete) {
	const subscription = this.subscribe(
		item => {
			try {
				next(item);
			}
			catch(e) {
				console.error(e.stack || e);
				subscription.unsubscribe();
			}
		},
		error,
		complete);

	return subscription;
};

Observable.prototype.catchWrap = function () {
	return this.catch(error => Observable.of({error: error}));
};

Observable.fromEventNoDefault = function (element, event) {
	return Observable.fromEvent(element, event)
		.do(e => e.preventDefault());
};

Observable.fromPrompt = function (prompText) {
	return new Observable(observer => {
		const result = window.prompt(prompText);
		observer.next(result);
		observer.complete();
	});
};