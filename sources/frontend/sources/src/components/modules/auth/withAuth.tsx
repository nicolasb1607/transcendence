import React, {useEffect} from "react";
import { useLocation } from "wouter";
import jwt_decode from 'jwt-decode';
import { getJWT } from "./getSessionCookie";

/**
 * Protect current route from non logged user
 */
export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
	return function AuthenticatedComponent(props: P) {
		const [location, navigate] = useLocation();

		useEffect(() => {
			const checkAuth = () => {
				const existingCookie = getJWT() as string;

				if (existingCookie){
					const {ID, exp} = jwt_decode<JWTData>(existingCookie);
					if (ID > 0 && exp > Date.now() / 1000) {
						return ;
					}
				}
				localStorage.setItem("current_page", `${location}`)
				navigate('/auth/login');
			}
			checkAuth();
		}, []);

		return <WrappedComponent {...props} />;
	};
}
