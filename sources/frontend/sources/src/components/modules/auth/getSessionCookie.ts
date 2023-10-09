export const getJWT = ():string|null => {
	return (document.cookie.split('; ').find(row => row.startsWith('jwt_token'))?.split('=')[1] || null);
}

//@todo ADD HTTP ONLY
export const setCookie =  (name: string, value: string, days: number) => {
	const date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	const expires = "; expires=" + date.toUTCString();
	document.cookie = name + "=" + (value || "") + expires + "; path=/; sameSite=Strict;"// HttpOnly";
}

export const deleteCookie = (cookieName : string ) => {
	document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
