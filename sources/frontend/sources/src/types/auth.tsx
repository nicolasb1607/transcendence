/* eslint-disable @typescript-eslint/no-unused-vars */

type authType = "login" | "register";

type availableProviders = "google" | "42";


interface FormError<FormInput> {
	/**
	 * The name of the input
	 */
	name: FormInput;
	valid: boolean;
	/**
	 * The error encountered
	 */
	error?: string;
}

namespace authForm {
	export type Inputs = "email" | "password" | "username" | "passwordConfirm";

	export type error = FormError<Inputs>;

	export interface Response {
		success: boolean;
		errors?: error[];
	}

	export type validatorMap = {
		[key in Inputs]: (value: string, values:FormData) => error
	};
}

interface AuthResponse {
	success: boolean;
	/**
	 * JWT token containing the user data
	 */
	token?: string;
	message?: string;
}

interface ApiToken {
	accessToken?: string;
}

interface TwoFAResponse {
	success: boolean;
	message: string;
}
/**
 * The assertion of the login request, used to display the error message
 * or the loading spinner
 */
interface LoginAssertion {
	/**
	 * The error message returned by the API
	 */
	message: string|undefined
	isLoading: boolean
}

interface TwoFaAssertion {
	transactionCode: string|undefined
	isLoading: boolean
}

/**
 * The assertion of the register request, used to display the error message
 * on each input or the loading spinner
 */
interface RegisterAssertion {
	data: authForm.Response | undefined
	isLoading: boolean
}

/**
 * The data sent to the API to register a user
 */
interface RegisterDto {
	login: string;
	email: string;
	/**
	 * Hashed password
	 */
	password: string;
}

interface authUser {
	session: UserSession | undefined;
	isLoading: boolean;
	refresh:boolean;
}

type editProfilInputs = "firstName" | "lastName" | "email" | "description" | "username";
interface editProfilFormError {
	wrongField: editProfilInputs;
	error: string;
}

