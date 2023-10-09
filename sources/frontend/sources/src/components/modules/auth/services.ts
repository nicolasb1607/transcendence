import { validateEmail, validatePassword, validateName, validatePasswordConfirm } from "./assertFields";
import { loginUser, registerUser } from "../../../services/auth";
import { getJWT, setCookie } from './getSessionCookie';

/* export const providerSignIn = async (provider:availableProviders) => {
	return (null)
} */

export const saveTokenInCookie = (response: AuthResponse) => {
	const jwtCookie = getJWT();
	if (jwtCookie) return;
	if (!response?.token) return;

	setCookie('jwt_token', response?.token, 30);
}

const formInputToValidators:authForm.validatorMap = {
	email: validateEmail,
	password: validatePassword,
	username: validateName,
	passwordConfirm: validatePasswordConfirm
}

/**
 * Validate each input from the register form
 * @description This function will validate each input given, and
 * return a response object with the validity of each input.
 */
const validateRegisterForm = (authForm:FormData):authForm.Response => {
	let formErrors:authForm.error[] = [];

	for (const [key, value] of authForm.entries()) {
		if (key in formInputToValidators) {
			const authFormInput:authForm.Inputs = key as authForm.Inputs
			const inputValidity = formInputToValidators[authFormInput](value as string, authForm);
			formErrors.push(inputValidity);
		} else throw new Error("Invalid key in authForm");
	}
	formErrors = formErrors.filter((form) => form.valid === false);
	return ({
		success: formErrors.length === 0,
		errors: formErrors
	})
}

/**
 * Send a request to the backend to sign in
 * @param formData The login form data with email and password.
 */
export const signIn = async (formData:FormData):Promise<AuthResponse|undefined> => {

	const loginResponse = await loginUser(
		formData.get("email") as string,
		formData.get("password") as string,
		formData.get("authenticateCode") as string
	);
	if (typeof loginResponse === "undefined" || !loginResponse?.success) {
		//check if message is "Invalid 2FA code"
		//return info to setState in login page, that display the 2FA code input
		return ({
			success: false,
			message: loginResponse?.message || "An unexpected error occurred."
		});
	} else if ("token" in loginResponse) {
		saveTokenInCookie(loginResponse);
		delete loginResponse.token;
	}
	return (loginResponse);
}

/**
 * Validate each input from the auth form, and send a request to the backend
 */
export const register = async (formData:FormData):Promise<authForm.Response|AuthResponse|undefined> => {
	const formValidation = validateRegisterForm(formData);

	if (formValidation.success === false) {
		return (formValidation);
	}
	const registerResponse = await registerUser({
		email: formData.get("email") as string,
		password: formData.get("password") as string,
		login: formData.get("username") as string,
	});
	if (typeof registerResponse === "undefined" || registerResponse?.success === false) {
		return ({
			success: false,
			message: registerResponse?.message || "An unexpected error occurred."
		});
	} else if ("token" in registerResponse) {
		saveTokenInCookie(registerResponse);
		delete registerResponse.token;
	}
	return (formValidation);
}
