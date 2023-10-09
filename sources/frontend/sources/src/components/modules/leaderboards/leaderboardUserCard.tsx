import React from 'react';
import UserBadge from '../../common/UserBadge/UserBadge';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from 'wouter';

import styles from './leaderboardUserCard.module.css';
import levelProgression from "../../../data/levelProgression.json"

const LeaderboardUserCard = (props: LeaderboardUserCardProps) => {
	const { leaderBoardUser, rank, display } = props;
	const { ID, login, avatar, experience } = leaderBoardUser.user;
	const level = experience?.level || 0;
	const userLevelProgression = levelProgression[Math.floor((level / 10))];

	const genRank = () => (
		<div className={styles.rank}>{rank}{rank === 1 ? <hr/> : null}</div>
	);

	const genLogin = () => (
		<Link href={`/profile/${ID}`}>
			<a>
				<div className={styles.login} title={login}>{login}</div>
			</a>
		</Link>
	);

	const genStats = () => {
		if (!leaderBoardUser.stats.winRate) return null;
		const { winRate, playedGames } = leaderBoardUser.stats;
		return (
			<div className={`${styles.stats} ${styles.blueBg}`}>
				<span>{winRate}% / {playedGames} game{playedGames > 0 ? 's' : ''}</span>
				<LinearProgress
					variant="determinate"
					value={winRate}
				/>
			</div>
		)
	}
	const apiUrl = process.env.API_URL;

	const smAvatar = avatar ? `${apiUrl}${avatar.replace("avatars/public/", "avatars/public/small/")}` : "/images/profilPicture.png";

	//const smAvatar = avatar ? avatar?.replace("avatars/public/", "avatars/public/small/") : "/images/profilPicture.png";

	const genAvatar = () => (
		<Link href={`/profile/${ID}`}>
			<a>
				<div className={styles.avatar} style={{
					borderColor: userLevelProgression.color
				}}
				>
					<img src={smAvatar} alt="avatar" />
				</div>
			</a>
		</Link>
	);

	const genUserLevel = () => (
		<div className={`${styles.level} ${styles.blueBg}`}>
			<UserBadge type='filled' level={level}/>
			<span
				style={{color: userLevelProgression.color}}
			>{userLevelProgression.rank}</span>
			{rank === 1 ? genStats() : null}
		</div>
	)

	const genFirstPlace = () => (
		<>
			{genRank()}
			{genAvatar()}
			<div className={styles.end}>
				{genLogin()}
				{genUserLevel()}
			</div>
		</>
	)

	const genIntermediatePlace = () => (
		<>
			<div className={styles.top}>
				{genRank()}
				{genAvatar()}
				{genLogin()}
			</div>
			{genUserLevel()}
			{genStats()}
		</>
	)

	const genPlace = () => (
		<>
			{genRank()}
			<div className={styles.player}>
				{genAvatar()}
				{genLogin()}
			</div>
			{genUserLevel()}
			{genStats()}
		</>
	)

	const genByDisplay = () => {
		if (display === "first") return genFirstPlace();
		if (display === "intermediate") return genIntermediatePlace();
		return genPlace();
	}

	const classes = [styles.leaderboardUserCard];
	if (rank > 5) classes.push(styles.tableRow);

	return (
		<div data-rank={rank} data-level={level} data-display={display} className={classes.join(" ")}>
			{genByDisplay()}
		</div>
	);
};

interface LeaderboardUserCardProps {
	leaderBoardUser: LeaderBoardUser
	rank: number;
	display: "first" | "intermediate" | "table";
	selectedGame: GameType | "all";
}

export default LeaderboardUserCard;