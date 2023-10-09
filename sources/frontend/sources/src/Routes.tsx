import React, { lazy, Suspense } from 'react';
import { Route } from "wouter";

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const Game = lazy(() => import('./pages/Game'));
const UserPage = lazy(() => import('./pages/UserPage/UserPage'));
const Auth = lazy(() => import('./pages/Auth'));
const Leaderboards = lazy(() => import('./pages/Leaderboards/Leaderboards'));
const ChatRooms = lazy(() => import('./pages/ChatRooms'));

/**
 * Display component, if path is the same as in the url
 */

const Routes = () => {


	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Route path="/" component={HomePage} />
			<Route path="/pong/spatialPong">
				<Game type={"spatial"} />
			</Route>
			<Route path="/pong/classic">
				<Game type={"classic"} />
			</Route>
			<Route path="/profile" component={UserPage}/>
			<Route path="/profile/:userId" component={UserPage}/>
			<Route path="/auth/:authType">
				{params => <Auth authType={params.authType as authType|undefined} />}
			</Route>
			<Route path="/chat-rooms" component={ChatRooms} />
			<Route path="/leaderboards" component={Leaderboards} />
		</Suspense>
	);
};

export default Routes;