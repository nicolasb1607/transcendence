import { getJWT } from "../components/modules/auth/getSessionCookie";

export async function tryUpload(formData: FormData, enqueueSnackbar: (message: string, options?: object) => void): Promise<string | undefined> {
	try {
		const response = await fetch(process.env.API_URL + 'api/avatar/upload', {
			method: 'POST',
			headers: {
				"Authorization": `Bearer ${getJWT()}`
			},
			body: formData
		});

		if (response.ok) {
			const data = await response.json();
			if (data.message === 'File uploaded successfully' && data.avatarUrl) {
				enqueueSnackbar("Avatar uploaded successfully", { variant: 'success' });
				return data.avatarUrl;
			}
		} else {
			const responseText = await response.text();
			const jsonResponse = JSON.parse(responseText);
			if (jsonResponse.message) {
				enqueueSnackbar(jsonResponse.message, { variant: 'error' });
			}
		}
	} catch (error) {
		console.error("Error while uploading the avatar:", error);
	}
	return undefined;
}
