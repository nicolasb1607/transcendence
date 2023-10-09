//services/auth.ts
import { getJWT } from "../components/modules/auth/getSessionCookie";
import { saveTokenInCookie } from "../components/modules/auth/services";
const handleResponse = (response:ApiToken|NestError):AuthResponse => {
	if ("error" in response) {
		return ({
			success: false,
			message: response.message,
		});
	}
	return ({
		success: "accessToken" in response,
		token: response?.accessToken,
	});
}

const handleTwoFAResponse = (response: TwoFAResponse):AuthResponse => {
	if ("error" in response) {
		return ({
			success: false,
			message: response.message,
		});
	}
	return ({
		success: true,
		message: response?.message,
	});
}

export const loginUser = async (username: string, password: string, authenticateCode?: string):Promise<AuthResponse|undefined> => {
	
	try {
		const response = await fetch(process.env.API_URL + "api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ login:username, password, twoFACode:authenticateCode })
		});
		if (response.status === 429){
			return ({
				success: false,
				message: "Too many requests, please try again later."
			});
		}
		return (handleResponse(await response.json()));
	} catch (error) {
		return (undefined);
	}
};

export const registerUser = async (formData:RegisterDto):Promise<AuthResponse|undefined> => {
	try {
		const response = await fetch(process.env.API_URL +"api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(formData)
		});
		if (response.status === 429){
			return ({
				success: false,
				message: "Too many requests, please try again later."
			});
		}
		return (handleResponse(await response.json()));
	} catch (error) {
		return (undefined);
	}
}

export const activateTwoFA = async ():Promise<AuthResponse|undefined> => {

	try {
		const response = await fetch(process.env.API_URL + "api/auth/2fa", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
		});
		return (handleTwoFAResponse(await response.json()));
	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

export const confirmTwoFA = async (status: boolean): Promise<AuthResponse|undefined> => {

	try {
		const response = await fetch(process.env.API_URL + `api/auth/2fa/state/?activate=${status}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
		});
		return (handleTwoFAResponse(await response.json()));
	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

export const validate2faOauth = async (
	transactionCode: string,
	userCode: string,
	setFormAssertion: React.Dispatch<React.SetStateAction<LoginAssertion>>
): Promise<AuthResponse | undefined> => {
	try {
		const response = await fetch(process.env.API_URL + "api/auth/validate2fa", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({ transactionCode, userCode }),
		});

		if (response.ok) {
			const jsonResponse = await response.json();
			if (jsonResponse.accessToken) {
				const authResponse: AuthResponse = {
					success: true,
					token: jsonResponse.accessToken,
				};
				saveTokenInCookie(authResponse);
				window.location.reload();
			}
		} else {
			const errorResponse = await response.json();
			setFormAssertion({
				message: errorResponse.message || "An error occurred",
				isLoading: false,
			});
		}
	} catch (error) {
		console.error(error);
		setFormAssertion({
			message: "An unexpected error occurred",
			isLoading: false,
		});
		return undefined;
	}
};
  