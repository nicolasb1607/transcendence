import React, {useContext} from 'react';
import { ThemeContext } from '../modules/ThemePicker/theme';
import Header from './header';
import Tchat from './tchat/Tchat';
import { useLocation } from "wouter";
import genSiteColor from '../../styles/genSiteColor';
import { Helmet } from "react-helmet";
import Sidebar from './sidebar/Sidebar';

import "../../styles/style.css"

const Layout = (props: LayoutProps) => {
	const [location] = useLocation();
	const { theme } = useContext(ThemeContext);

	const importFont = () => {
		return (
			<>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
			</>
		);
	}

	const genHead = () => {
		return (
			<Helmet title='Transcendance'>
				{genSiteColor(theme)}
				<link rel="icon" href="/favicon.png" />
			</Helmet>
		)
	}

	const genHomepageLayout = () => {
		return (
			<>
				<Header />
				{props.children}
			</>
		);
	}

	const genLayout = () => {
		return (
			<>
				<Sidebar />
				<div id="content">
					{props.children}
				</div>
				<Tchat />
			</>
		);
	}
	
	const disabledLocation = ["/", "/auth/login", "/auth/register"];
	return (
		<>
			{genHead()}
			{importFont()}
			{disabledLocation.includes(location) ? genHomepageLayout() : genLayout()}
		</>
	)
};

interface LayoutProps {
	children: React.ReactNode;
}

export default Layout;