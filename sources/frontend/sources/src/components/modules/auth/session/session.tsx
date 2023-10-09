import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadDetailedSession } from './loadSession';
import { ThemeContext } from '../../ThemePicker/theme';
import { getJWT } from '../getSessionCookie';

export const Session = createContext<SessionContext|undefined>(undefined);

const SessionProvider = (props:SessionProviderProps) => {
	const themeContext = useContext(ThemeContext);
	const [authUser, setAuthUser] = useState<authUser>({
		session: undefined,
		isLoading: true,
		refresh: false
	});

	useEffect(() => {
		loadDetailedSession(setAuthUser, themeContext);
	}, [])

	useEffect(() => {

		const checkAuth = async () => {
			const existingCookie = getJWT();
			if (existingCookie != undefined){
				const res = await loadDetailedSession(setAuthUser, themeContext);
				if (res === true) return ;
			}
			setAuthUser({
				session: undefined,
				isLoading: false,
				refresh: false
			});
		}

		if (authUser?.refresh === true){
			setAuthUser({
				...authUser,
				refresh: false
			});
			checkAuth();
		}
	}, [authUser?.refresh]);

	const updateUserRelation = (newStatus:friendshipStatus|'none', targetId:number) => {
		if (!authUser.session?.ID) return ;
		console.log(`Updating relation with ${targetId} to ${newStatus}`);
		const relations:userRelations = {...authUser.session.relations};
		for (const [key, value] of Object.entries(relations)) {
			//key
			if (value.indexOf(targetId) !== -1) {
				relations[key as keyof userRelations] = value.filter((id:number) => id !== targetId);
			}
		}
		if (newStatus !== 'none') {
			relations[newStatus as keyof userRelations].push(targetId); 
		}
		setAuthUser({
			session: {
				...authUser.session,
				relations
			},
			isLoading: false,
			refresh: false
		})
	}

	return (
		<Session.Provider value={{authUser, setAuthUser, updateUserRelation}}>
			{props.children}
		</Session.Provider>
	)
}

interface SessionProviderProps {
	children: React.ReactNode
}
export default SessionProvider;