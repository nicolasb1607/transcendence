import React, {useEffect, useState} from 'react';
import { fetchUserStats } from '../../../services/user';
import {convertPlayTime, statsDisplay} from "./statDisplay"

import styles from './UserStats.module.css';
import { Helmet } from 'react-helmet';

const UserStats = (props: UserStatsProps) => {
	const {userId} = props;
	const [userStats, setUserStats] = useState<enhanceUserStat|null>(null);

	useEffect(() => {
		const loadUserStats = async () => {
			setUserStats(await fetchUserStats(props.userId));
		}
		loadUserStats();
	}, [userId]);

	const genStat = (title: string, value: number|undefined, type:"card"|"lower") => (
		<div className={type === "card" ? styles.statCard : styles.lower} key={title}>
			<span>{title}</span>
			<span>{value ? value : 0}</span>
		</div>
	)

	const genStatsOverview = () => {
		const loose = userStats?.loose || 0;
		const win = userStats?.win || 0;
		const totalGame = loose + win;
		return (
			<div className={styles.card}>
				<div className={styles.cardHeader}>
					<div>
						<img src="/icons/stat.svg" alt="stats" />
						<h1>S1: Stats Overview</h1>
					</div>
					<div id={styles.playTime}>
						<img src="/icons/clock.svg" alt="clock" />
						<span>{convertPlayTime(userStats?.play_time)} Playtime</span>
					</div>
				</div>
				<img src="/div.highlighted.png" alt="banner" className={styles.banner} />
				<div id={styles.stats}>
					<div>
						{genStat('Win %', userStats?.win_rate, 'card')}
						{genStat('Played games', totalGame, 'card')}
						{genStat('XX1', 0, 'card')}
						{genStat('XX2', 0, 'card')}
					</div>
					<div id={styles.lowerStats}>
						{genStat('Wins', userStats?.win, 'lower')}
						{genStat('Loose', userStats?.loose, 'lower')}
						{genStat('Max Game Speed', userStats?.max_game_speed, 'lower')}
						{genStat('Bounce', userStats?.bounce, 'lower')}
						{genStat('Cascade Bounce', userStats?.cascade_bounce, 'lower')}
						{genStat('Total Score', userStats?.score, 'lower')}
					</div>
				</div>
			</div>
		)
	}

	const genStatsDetailsRows = (): JSX.Element[]|undefined => {
		if (!userStats) return ;
		const playDetailsRows = [];
		if (userStats !== null){
			for (let [key, value] of Object.entries(userStats)) {
				const configForKey = statsDisplay[key as enhanceStatKeys|statKey];
				if (configForKey && configForKey.display === false) continue;
				key = configForKey?.name ? configForKey.name : key.replace(/_/g, ' ');
				value = configForKey?.convert ? configForKey.convert(value) : value;
				playDetailsRows.push(
					<div key={key}>
						<span>{key}</span>
						<span>{value as string}</span>
					</div>
				)
			}
		}
		return (playDetailsRows);
	}

	const genStatsDetails = () => {
		return (
			<div className={styles.card}>
				<div className={styles.cardHeader}>
					<img src="/icons/details.svg" alt="details" />
					<h1>Play Details</h1>
				</div>
				<div id={styles.table}>
					{genStatsDetailsRows()}
				</div>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<Helmet title='Profile | Stats' />
			{genStatsOverview()}
			{genStatsDetails()}
		</div>
	);
};

interface UserStatsProps {
	userId: number;
}

export default UserStats;