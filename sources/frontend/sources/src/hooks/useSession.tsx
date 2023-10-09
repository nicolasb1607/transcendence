import { useContext } from "react"
import { Session } from "../components/modules/auth/session/session";

/**
 * Provide current user session if it's loaded
 * @returns [Session, isLoading, setAuthUser]
 */
export const useSession = ():useSessionReturn => {
	const sessionHandler = useContext(Session);

	return ([
		sessionHandler?.authUser?.session,
		sessionHandler?.authUser?.isLoading,
		sessionHandler?.setAuthUser,
		//eslint-disable-next-line @typescript-eslint/no-empty-function
		sessionHandler?.updateUserRelation || (() => {})
	]);
}

type useSessionReturn = [
	UserSession | undefined,
	boolean | undefined,
	React.Dispatch<React.SetStateAction<authUser>> | undefined,
	(newStatus:friendshipStatus|'none', targetId:number) => void
]