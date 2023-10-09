import React from 'react';
import { Helmet } from 'react-helmet';
import Register from '../../components/modules/auth/Register';
import Login from '../../components/modules/auth/Login';
import { useSession } from '../../hooks/useSession';
import { navigate } from "wouter/use-location";

import styles from '../../components/modules/auth/Auth.module.css';

const Auth = (props: AuthProps) => {
	const { authType } = props;
	const [session, isLoading] = useSession();
	if (!isLoading && session?.ID) navigate('/profile/' + session.ID);

	const genHead = () => {
		return (
			<Helmet>
				<title>Auth</title>
				<style>
					{`.header {background-color: rgb(14, 31, 51)!important;}`}
				</style>
			</Helmet>
		)
	}

	const genLoginArea = () => {
		switch (authType) {
		case 'login':
			return <Login />;
		default:
			return <Register />;
		}
	}

	return (
		<div id={styles.content}>
			{genHead()}
			<div id={styles.loginArea}>
				{genLoginArea()}
			</div>
			{/* eslint-disable-next-line react/self-closing-comp */}
			<div id={styles.authWallpaper}></div>
		</div>
	);
};

interface AuthProps {
	authType: authType | undefined;
}

export default Auth;