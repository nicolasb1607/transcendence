import jwt_decode from 'jwt-decode';
import { retrieveUserRelation } from '../../../../services/user';
import { getJWT, deleteCookie } from '../getSessionCookie';

const handleCoalition = (coalition:userCoalition42, themeContext:ThemeContext) => {
	const themeUpdated = localStorage.getItem("themUpdated");
	if (themeUpdated === "true") return;
	if (coalition === "The Federation") {
		themeContext.changeTheme("federation");
	} else if (coalition === "The Order") {
		themeContext.changeTheme("order");
	} else if (coalition === "The Assembly") {
		themeContext.changeTheme("assembly");
	} else if (coalition === "The Alliance") {
		themeContext.changeTheme("alliance");
	}
	localStorage.setItem("themUpdated", "true");
}


export const loadDetailedSession = async (
	setAuthUser:React.Dispatch<React.SetStateAction<authUser>>,
	themeContext:ThemeContext
):Promise<boolean> => {
	const cookie = getJWT();
	if (!cookie) return (false);
	const {ID} = jwt_decode<JWTData>(cookie);
	
	try {
		const response = await fetch(
			process.env.API_URL + `api/users/${ID}/?loadDetails=true`);
		const detailsResponse: UserDetails|NestError = await response.json();
		if ("error" in detailsResponse && 
		(detailsResponse.error === "Unauthorized" || detailsResponse.error === "NotFoundError")) {
			deleteCookie("jwt_token");
			setAuthUser({
				session: undefined,
				isLoading: false,
				refresh: false
			});
			return (false);
		}
		if (detailsResponse === undefined) return (false)
		const relations = await retrieveUserRelation(ID) || {friend: [], blocked: [],requested: [], requesting: []};
		const detailedSession: UserSession = {
			...detailsResponse as UserDetails,
			relations
		}
		if (detailedSession.coalition !== undefined) {
			handleCoalition(detailedSession.coalition as userCoalition42, themeContext);
		}
		setAuthUser({
			session: detailedSession,
			isLoading: false,
			refresh: false
		});
		return (true);
	} catch (error) {
		return (false);
	}
}