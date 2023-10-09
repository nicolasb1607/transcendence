import React, { useEffect, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { withAuth } from '../../components/modules/auth/withAuth';
import { Tab, Tabs } from '@mui/material';
import { Helmet } from 'react-helmet';
import { tabStyle } from './gameStyle';
import { navigate } from 'wouter/use-location';
import AwaitingChallenge from '../../components/modules/Challenge/AwaitingChallenge';

import styles from './Game.module.css';

const gameInfos = {
	classic: {
		name: 'Classic',
		id: 'classic',
		logo: '/classic.svg'
	},
	spatial: {
		name: 'Spatial Pong',
		id: 'spatial',
		logo: '/astronaut.svg'
	}
}

const Game = (props: gameProps) => {
	const currentGameInfo = gameInfos[props?.type || 'classic'];
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const content = document.querySelector('.game-content');
		if (!content) return ;
		const script = document.createElement('script');
		script.src = `/${currentGameInfo.id}/index.js`;
		script.async = true;
		script.id = 'game-script';
		content.appendChild(script);
		document.title = currentGameInfo.name;

		const styleSheet = document.createElement('link');
		styleSheet.rel = 'stylesheet';
		styleSheet.href = `/gameStyle.css`;
		content.appendChild(styleSheet);

		return () => {
			content.removeChild(script);
			content.removeChild(styleSheet);
		}
	}, []);

	const genHeadBar = () => {
		return (
			<div id={styles.headBar}>
				<button id={styles.headBarLeft} onClick={() => navigate('/')}>
					<div id={styles.goBack}>
						<ArrowBackIcon />
					</div>
					<div className={styles.titleWithSub}>
						<span>Go Back</span>
						<span>Go Back to home</span>
					</div>
				</button>
				<div id={styles.headBarCenter}>
					<img
						src={currentGameInfo.logo}
						alt={`Logo of ${currentGameInfo.name}`}
						width={40}
						height={40}
					/>
					<h1>{currentGameInfo.name}</h1>
				</div>
				<div className={styles.titleWithSub} id={styles.headBarRight}>
					<span>{currentGameInfo.name}</span>
					<span>Studios 42</span>
				</div>
			</div>
		);
	}

	return (
		<div id={styles.contentGame}>
			<div id={styles.content}>
				<Helmet title={"Game | " + currentGameInfo.name} />
				{genHeadBar()}
				<div id={styles.gameArea} ref={contentRef} className='game-content'>
					<AwaitingChallenge/>
					{/* eslint-disable-next-line react/self-closing-comp */}
					<div id="end-screen"></div>
					<div id="loading-screen">
						{/* eslint-disable-next-line react/self-closing-comp */}
						<div id="loader-area">
						</div>
					</div>
					<div id="mute-container">
						<img src="" alt="" id="mute" />
					</div>
					<canvas 
						id="game-scene"
						tabIndex={0}
						ref={canvasRef}
					/>
				</div>
			</div>
		</div>
	);
}

interface gameProps {
	type?: GameType
}

const gameWithAuth = withAuth(Game);

export default gameWithAuth;
