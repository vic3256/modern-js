import fs from 'fs';
import {Observable} from 'rxjs';

// This file is to load/save any json data with return rxjs observables
// wrapping fs read/write in reactive extensions Observable so I can invoke
// them from reactive extensions and have them return an observable stream
const readFile = Observable.bindNodeCallback(fs.readFile);
const writeFile = Observable.bindNodeCallback(fs.writeFile);

export class FileRepository {
	constructor(filename) {
		this._filename = filename;
	}

	getAll$() {
		return readFile(this._filename)
		.map(contents => JSON.parse(contents))
		.do(() => {
			console.log(`${this._filename}: got all data`);
		})
		.catch(e => {
			console.error(`${this._filename}: failed to get all data ${e.stack || e}`);
			return Observable.throw(e);
		});
	}

	save$(items) {
		return writeFile(this._filename, JSON.stringify(items))
			.do(() => {
				console.log(`${this._filename}: data saved`);
			})
			.catch(e => {
				console.error(`${this._filename}: failed to save data ${e.stack || e}`);
			});
	}
}