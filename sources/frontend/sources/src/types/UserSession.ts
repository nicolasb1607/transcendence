/* eslint-disable @typescript-eslint/no-unused-vars */
interface userRelations {
	friend: number[];
	requested: number[];
	requesting: number[];
	blocked: number[];
}

type UserSession = UserDetails & {
	relations: userRelations;
}

interface UserSessionAction {
	type: UpdateAction;
	session: UserSession;
}

type UpdateAction = "UPDATE" | "CLEAR"

interface SessionContext {
	/**
	 * Session object which contains user datas & if the user
	 * is loaded or not
	 */
	authUser: authUser;
	/**
	 * Function used in useReducer to update user data object
	 */
	setAuthUser: React.Dispatch<React.SetStateAction<authUser>>;
	updateUserRelation: (newStatus:friendshipStatus|'none', targetId:number) => void;
}