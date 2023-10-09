
import { getJWT } from "../components/modules/auth/getSessionCookie";

export const fetchUserAchievements = async (userId:number):Promise<number[]|null> => {
	try {
		const response = await fetch(process.env.API_URL +`api/users/${userId}/achievements`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		const data:number[] = await response.json();
		return (data);
	} catch (error) {
		return (null);
	}
}

export const getUsersByIds = async (ids:number[], loadDetails = true):Promise<User[]|UserDetails[]> => {
	try {
		const response = await fetch(process.env.API_URL +`api/users/list?loadDetails=${loadDetails}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ ids })
		});
		return (await response.json());
	} catch (error) {
		return ([]);
	}
}

export const getUserById = async (id:number):Promise<UserDetails|null> => {
	try {
		const response = await fetch(process.env.API_URL +`api/users/${id}?loadDetails=true`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		const data = await response.json();
		if ("error" in data) return (null);
		return (data);
	} catch (error) {
		return (null);
	}
}


export const fetchUserStats = async (userId:number):Promise<enhanceUserStat|null> => {
	try {
		const response = await fetch(process.env.API_URL +`api/users/${userId}/stats`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (await response.json());
	} catch (error) {
		// console.error(error);
		return (null);
	}
}

export const searchUsers = async (username:string):Promise<UserDetails[]> => {
	try {
		username = (username === "") ? "*" : username;
		const response = await fetch(process.env.API_URL +`api/users/search/${username}?enhanced=true&page=0`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		if (response.status === 200) return (await response.json());
		return ([]);
	} catch (error) {
		// console.error(error);
		return ([]);
	}
}

export const getUsersStatus = async ():Promise<PlayerStatus> => {
	try {
		const jwt = getJWT();
		if (!jwt) return ([]);
		const response = await fetch(process.env.API_URL +`api/users/status`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${jwt}`
			}
		});
		if (response.status === 200) return (await response.json());
		return ([]);
	} catch (error) {
		// console.error(error);
		return ([]);
	}
}

export const updateUserStatus = async (status?:UserStatus):Promise<void> => {
	const jwt = getJWT();
	if (!jwt) return;
	try {
		await fetch(process.env.API_URL +`api/users/updateStatus`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
			body: JSON.stringify({
				status: status || "online"
			})
		});
	} catch (error) {
		// console.error(error);
	}
}

export const getUser2faStatus = async ():Promise<boolean|undefined> => {
	const jwt = getJWT();
	if (!jwt) return (undefined);
	try {
		const response = await fetch(process.env.API_URL + `api/users/2faStatus`, {
			method: "GET",
			headers: {
				"Content-type": "application/json",
				"Authorization": `Bearer ${jwt}`
			}
		});
		if (response.status === 200) return (await response.json());
	} catch (error) {

	}

}
// /**
// * Fetch all userID games history and save it into the useState Games variable
// * @param userID
// * @param setGames from a React useState () => void
// * @returns void
// **/
export const fetchUserGamesData = async (userID:number):Promise<BackendGame[]> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/${userID}/history`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
		return (response.json());
	} catch (error) {
		console.error("Error fecthing game data: ", error);
		return ([]);
	}
};

export const retrieveUserRelation = async (userID: number | undefined):Promise<userRelations|undefined> => {
	try {
		const response = await fetch(process.env.API_URL + `api/relations/${userID}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
		return (await response.json());
	} catch (error) {
		console.log(error);
		return (undefined);
	}
}

export const challengeUser = async (userID: number):Promise<void> => {
	try {
		await fetch(process.env.API_URL + `api/users/challenge/${userID}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
	} catch { }
}

export const acceptChallenge = async (userID: number | undefined, accept = true):Promise<userRelations|NestError|undefined> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/challenge/accept/${userID}?response=${accept}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
		const data = await response.json();
		console.log({data})
		return (data);
	} catch (error) {
		console.log({error});
	}
}

export const cancelChallenge = async ():Promise<void> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/challenge/cancel`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
		return (await response.json());
	} catch (error) {}
}


export const getChallenge = async ():Promise<Challenge[]|null> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/challenge`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			}
		})
		const data = await response.json();
		if ("statusCode" in data) return (null);
		return (data);
	} catch (error) {
		return (null);
	}
}