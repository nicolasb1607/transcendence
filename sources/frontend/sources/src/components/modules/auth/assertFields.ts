/**
 * Must be a valid email address.
 */
export const validateEmail = (email:string):authForm.error => {
	const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let error;

	if (email.length > 255) {
		error = "Your email address must be less than 255 characters long";
	} else if (!mailRegex.test(email)) {
		if (!email.includes("@")) {
			error = "Your email address must contain an '@' symbol";
		} else if (!email.includes(".")) {
			error = "Your email address must contain a valid domain eg. '.com', '.co.uk', '.org'";
		} else {
			error = "Your email address is invalid";
		}
	}
	return ({
		valid: error === undefined,
		name: "email",
		error,
	})
}

/**
 * Must be at least 12 characters long, must contain
 * at least one uppercase letter, one lowercase letter,
 * one number, and one special character.
 */
export const validatePassword = (password:string):authForm.error => {
	const lowercaseRegex = /[a-z]/;
	const uppercaseRegex = /[A-Z]/;
	const digitRegex = /\d/;
	const specialRegex = /[!@#$%^&*?_~]/;
	let error;

	if (password.length < 12) {
		error = "Your password must be at least 12 characters long";
	}
	if (password.length > 70) {
		error = "Your password must be less than 70 characters long";
	}
	if (!lowercaseRegex.test(password)) {
		error = "Your password must contain at least one lowercase letter";
	}
	if (!uppercaseRegex.test(password)) {
		error = "Your password must contain at least one uppercase letter";
	}
	if (!digitRegex.test(password)) {
		error = "Your password must contain at least one number";
	}
	if (!specialRegex.test(password)) {
		error = "Your password must contain at least one special character (!@#$%^&*?_~)";
	}
	return ({
		valid: error === undefined,
		name: "password",
		error,
	})
}

export const validatePasswordConfirm = (passwordConfirm:string, values: FormData):authForm.error => {
	const password:string = values.get("password") as string;
	let error;

	if (password !== passwordConfirm) {
		error = "Your passwords do not match";
	}
	return ({
		valid: error === undefined,
		name: "passwordConfirm",
		error,
	})
}

/**
 * Must be at least 3 characters long, can contain
 * letters, '-', and '_'.
 */
export const validateName = (name:string):authForm.error => {
	const nameRegex = /^[a-zA-Z0-9-_]+$/;
	let error;

	if (!nameRegex.test(name)) {
		error = "Your name can only contain letters, numbers, '-', and '_'";
	}
	if (name.length < 3) {
		error = "Your name must be at least 3 characters long";
	} else if (name.length > 20) {
		error = "Your email address must be less than 20 characters long";
	}
	return ({
		valid: error === undefined,
		name: "username",
		error,
	})
}