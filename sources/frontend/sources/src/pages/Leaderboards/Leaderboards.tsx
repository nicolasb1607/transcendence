import React, {useState, useEffect} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import LeaderboardUserCard from '../../components/modules/leaderboards/leaderboardUserCard';
import { withAuth } from '../../components/modules/auth/withAuth';
import { getLeaderboard } from '../../services/stats';

import styles from './Leaderboards.module.css';
import gameInfos from '../../data/gameInfos.json';
import { Helmet } from 'react-helmet';

const Leaderboards = () => {
	const [leaderboard, setLeaderboard] = useState<LeaderBoardUser[]>([]);
	const [selectedGame, setSelectedGame] = useState<GameType|"all">("all");
	const { width } = useWindowDimensions();
	const limitIntermediate = width > 1640 ? 5 : (width > 1405 ? 4 : 3);
	const topLeaderboard = leaderboard.slice(1, limitIntermediate);
	const endLeaderboard = leaderboard.slice(limitIntermediate);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLeaderboard((await getLeaderboard()).filter((user) => user.user));
		}
		fetchLeaderboard();
	}, []);

	const handleSelectedGameChange = (event: React.SyntheticEvent, value:string) => {
		event as React.MouseEvent<HTMLDivElement>;
		setSelectedGame(value as GameType);
	}

	const genTopBar = () => {
		const gameKeys = Object.keys(gameInfos);
		return (
			<div id={styles.topBar}>
				<Tabs
					value={selectedGame}
					onChange={handleSelectedGameChange}
					centered
				>
					<Tab
						label="All"
						value="all"
					/>
					{gameKeys.map((gameKey, index) => {
						return (
							<Tab
								label={gameInfos[gameKey as GameType].name}
								value={gameKey}
								key={index}
								disabled
							/>
						)
					})}
				</Tabs>
				<Select
					value={"winRate"}
					disabled
				>
					<MenuItem value={"winRate"}>WinRate</MenuItem>
				</Select>
			</div>
		)
	}

	const genTableHeader = () => {
		return (
			<div className={styles.tableHeader}>
				<span>Rank</span>
				<span>Player</span>
				<span>Level</span>
				<span>Win Rate</span>
			</div>
		)
	}

	const genContent = () => {
		if (leaderboard.length === 0) return ;
		return (
			<>
				<LeaderboardUserCard
					leaderBoardUser={leaderboard?.[0]}
					rank={1}
					selectedGame={selectedGame}
					display='first'
				/>
				<div className={styles.topLeaderboard}>
					{topLeaderboard.map((leaderBoardUser, index) => {
						return (
							<LeaderboardUserCard
								leaderBoardUser={leaderBoardUser}
								rank={index + 2}
								key={index}
								selectedGame={selectedGame}
								display='intermediate'
							/>
						)
					})}
				</div>
				<div id={styles.endLeaderboard}>
					{genTableHeader()}
					{endLeaderboard.map((leaderBoardUser, index) => {
						return (
							<LeaderboardUserCard
								leaderBoardUser={leaderBoardUser}
								rank={index + topLeaderboard.length + 2}
								key={index}
								selectedGame={selectedGame}
								display='table'
							/>
						)
					})}
				</div>
			</>
		)
	}
	
	return (
		<div id={styles.leaderboard}>
			<Helmet title='Leaderboard' />
			{genTopBar()}
			{genContent()}
		</div>
	);
};

const LeaderboardsWithAuth = withAuth(Leaderboards);

export default LeaderboardsWithAuth;