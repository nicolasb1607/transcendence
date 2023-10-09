import { getJWT, setCookie } from "../components/modules/auth/getSessionCookie";

const updateUser = async (updateData: UpdateDTO): Promise<ApiToken|NestError|undefined> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/meta`, {
			method: "PUT", 
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
			body: JSON.stringify(updateData)
		});
		const data:ApiToken|NestError = await response.json();
		if (data && "statusCode" in data) return (data);
		return (data);
	} catch (error) {
		return (undefined);
	}
}

export const updateInfo = async (userID:number, formData:FormData):Promise<ApiToken|NestError|undefined> => {
	const updateResponse = await updateUser({
		ID: userID as number,
		email: formData.get("email") as string,
		login: formData.get("username") as string, 
		firstName: formData.get("firstName") ? formData.get("firstName") as string : undefined,
		lastName: formData.get("lastName") ? formData.get("lastName") as string : undefined,
		description: formData.get("description") ? formData.get("description") as string : undefined,
	});
	if (updateResponse && "statusCode" in updateResponse) {
		return (updateResponse);
	}
	if (!updateResponse?.accessToken) {
		return (undefined);
	}
	setCookie("jwt_token", updateResponse?.accessToken as string, 30);
	return (updateResponse);
}

export const updateAvatarInDB = async (avatarPath: string, userData: UserDetails) => {
	const imageBasePath = `avatars/`;
	const updateData = {
		ID: userData.ID,
		login: userData.login,
		email: userData.email,
		avatar: imageBasePath + avatarPath
	}

	try {
		const response = await fetch(process.env.API_URL + `api/users/meta`, {
			method: "PUT", 
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
			body: JSON.stringify(updateData)
		});
		const data:UserMeta = await response.json();
		return (data);
	} catch (error) {
		return (undefined);
	}
}
