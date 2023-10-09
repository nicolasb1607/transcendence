import { getJWT } from "../components/modules/auth/getSessionCookie";

export const updateRelationInDb = async (newStatus:friendshipStatus, currentPageUserId:number, targetId:number):Promise<UserRelation|NestError|undefined> => {
	let useMethod = "PUT";
	if (newStatus === "none")
		useMethod = "DELETE";
	if (newStatus === "requesting")
		useMethod = "POST";

	try {
		const response = await fetch (process.env.API_URL + "api/relations", {
			method: useMethod,
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			},
			body: JSON.stringify({
				relationId: targetId,
				status: newStatus,
			})
		});
		return (await response.json());
	} catch (e) {
		return (undefined);
	}
}

export	const blockRelationInDb = async (currentPageUserId:number, targetId:number):Promise<UserRelation|NestError|undefined> => {
	try {
		const  response = await fetch (process.env.API_URL + "api/relations/block", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`,
			},
			body: JSON.stringify({
				relationId: targetId,
				status: "blocked",
			})
		});
		return (await response.json());
	} catch (e) {
		return (undefined);
	}
}
