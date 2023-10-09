import React from 'react';
import {Link} from "wouter";
import Button from '@mui/material/Button';

import headerConfig from "../../../data/header.json";
import styles from './Header.module.css';
import { useSession } from '../../../hooks/useSession';

const Header = ():JSX.Element => {
	const [session, isLoading] = useSession();
	const isUserLogged = session !== undefined && !isLoading;

	const genLogoArea = () => {
		return (
			<Link href="/">
				<div id={styles.logoArea}>
					<img src={"/pong_logo.jpg"} alt="Logo du site"/>
					<span id={styles.logoText}>Spatial Pong</span>
				</div>
			</Link>
		)
	}

	const genMenu = () => {
		const profileSuffix = isUserLogged ? `/${session?.ID}` : "";
		return (
			<ul id={styles.menu}>
				{headerConfig.map((menuRow:MenuRow, index:number):JSX.Element => {
					const link = menuRow.link === "/profile" ?
						menuRow.link + profileSuffix : menuRow.link;
					return (
						<li key={index}>
							<Link href={link}>
								{menuRow.name}
							</Link>
						</li>
					)
				})}
			</ul>
		);
	}
	
	const deleteCookie = (cookieName : string ) => {
		document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	}
	
	const handleLogout = () => {
		deleteCookie("jwt_token");
		window.location.reload();
	};

	const genLoginArea = () => {
		if (!isUserLogged) {
			return (
				<div id={styles.loginArea}>
					<Link href="/auth/login" className="button">
						<a href="/auth/login">
							<Button variant="contained">Login</Button>
						</a>
					</Link>
					<Link href="/auth/register">
						<a href="/auth/register">
							<Button variant="contained">Register</Button>
						</a>
					</Link>
				</div>
			)
		}
	
		return (
			<div id={styles.loginArea}>
				<Link href={`/profile/${session?.ID}`} className="button">
					<a>
						<Button variant="contained">Profile</Button>
					</a>
				</Link>
				<div>
					<Button variant="contained" onClick={handleLogout}>Logout</Button>
				</div>
			</div>
		);
	}

	return (
		<div id={styles.header} className='header'>
			<div>
				{genLogoArea()}
				{genMenu()}
			</div>
			{genLoginArea()}
		</div>
	);
};

export default Header;
