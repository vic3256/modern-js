// This validation runs both on the server and the client.
// Client can't validate if user is logged in - server will have the final say
// Only validating properties based upon themselves, things that it doesn't matter
// if someone spoofs the validation since the server will make the final call if operation is valid.

import {Validator} from '../validator';

export let USERNAME_REGEX = /^[\wd_-]+$/;

export function validateLogin(username) {
	const validator = new Validator();

	if(username.length >= 20) {
		validator.error('Username must be fewer than 20 characters');
	}

	if(!USERNAME_REGEX.test(username)) {
		validator.error('Username can only contain numbers, digits, underscores, and dashes');
	}

	return validator;
}