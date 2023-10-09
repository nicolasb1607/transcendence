import { getJWT } from "../components/modules/auth/getSessionCookie";

export const getLeaderboard = async ():Promise<LeaderBoardUser[]> => {
	try {
		const response = await fetch(process.env.API_URL + `api/users/leaderboard/winrate`, {
			method: "GET",
			headers: {
				"Content-type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
		});
		if (response.status !== 200) return ([]);
		return (await response.json());
	} catch (error) {
		return ([]);
	}
}