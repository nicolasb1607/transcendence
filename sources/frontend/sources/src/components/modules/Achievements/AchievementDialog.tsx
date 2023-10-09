import React, { useEffect, useState } from 'react';
import { initSocket, userSocket } from '../../../services/usersSocket';
import { Dialog, DialogContent, LinearProgress, Tooltip } from '@mui/material';

import achievementsData from '../../../data/achievements.json';
import styles from './AchievementDialog.module.css';

const AchievementDialog = () => {
	const [achievements, setAchievements] = useState<number[]|null>(null);
	const [userStats, setUserStats] = useState<userStat|null>(null);
	const currentBadge = achievements && achievements?.length > 0 ? (
		achievementsData.badges[achievements[0] - 1] as Achievement
	) : null;
	const currentBadgeGroup = currentBadge && currentBadge?.parent ? (
		achievementsData.badges.filter((badge) => badge.group === currentBadge.group) as Achievement[]
	) : null;

	useEffect(() => {

		const onUserAchievement = (achievementIds:number[], userStats:userStat) => {
			console.log("onUserAchievement", achievementIds, userStats)
			setAchievements(achievementIds);
			setUserStats(userStats);
		}

		initSocket();
		if (!userSocket) return ;
		userSocket.on('userAchievement', onUserAchievement);

		return () => {
			userSocket.off('userAchievement', onUserAchievement);
		}
	}, []);

	const getDifferenceForNextAchievement = () => {
		if (!currentBadge || !currentBadgeGroup || !currentBadge.unlock?.statKey) return (null);
		const currentBadgeIndexOnGroup = currentBadgeGroup?.findIndex((badge) => badge.id === currentBadge.id);
		if (currentBadgeIndexOnGroup === undefined || currentBadgeIndexOnGroup === -1) return (null);
		const nextBadge = currentBadgeGroup[currentBadgeIndexOnGroup + 1];
		if (!nextBadge) return (null);
		const currentAchievementStatValue = userStats?.[currentBadge.unlock?.statKey as statKey];
		const nextAchievementStatValue = nextBadge.unlock?.statValue;
		if (currentAchievementStatValue === undefined || nextAchievementStatValue === undefined) return (null);
		return ({
			current: currentAchievementStatValue,
			next: nextAchievementStatValue,
		})
	}

	const genAchievementGroup = () => {
		if (!currentBadgeGroup || !currentBadge) return (<></>);
		return (
			<div className={styles.achievementGroup}>
				{currentBadgeGroup.map((badge) => {
					console.log(`badge ${badge.id} owned: ${badge.id} <= ${currentBadge?.id}`)
					return (
						<Tooltip title={badge.description} key={badge.id} className={styles.tooltip}>
							<div className={styles.achievement} key={badge.id} data-owned={badge.id <= currentBadge?.id}>
								<img
									src={'/achievements/' + badge.image}
									alt={badge.name}
									width={60}
									height={60}
								/>
							</div>
						</Tooltip>
					)
				})}
			</div>
		)
	}

	const handleClose = () => {
		console.log("handleClose", achievements && achievements?.length > 0 ? achievements.slice(1) : null)
		setAchievements(achievements && achievements?.length > 0 ? achievements.slice(1) : null);
	}

	if (!achievements || achievements.length === 0 || !currentBadge) return (<></>);
	const differenceForNextAchievement = getDifferenceForNextAchievement();
	let difference = differenceForNextAchievement ? differenceForNextAchievement.next - differenceForNextAchievement.current : null;
	difference = difference ? (difference < 0 ? 0 : difference) : null;

	return (
		<Dialog
			open={achievements != null && achievements.length > 0}
			onClose={handleClose}
			className={styles.dialog}
		>
			<img src={'/achievements/' + currentBadge?.image} alt={currentBadge?.name} width={125} height={125} id={styles.currentAchievement} />
			<DialogContent className={styles.dialogContent}>
				<h2>{currentBadge?.name}</h2>
				{differenceForNextAchievement && currentBadge.parent ? (
					<>
						<LinearProgress
							variant="determinate"
							value={differenceForNextAchievement.current / differenceForNextAchievement.next * 100}
							className={styles.progressBar}
						/>
						<span className={styles.progressText}>
							You are {difference} {currentBadge?.postfix} away from the next achievement
						</span>
					</>
				) : (
					<span className={styles.progressText}>
						Well done! You have unlocked last achievement of this group
					</span>
				)}
				{genAchievementGroup()}
			</DialogContent>
		</Dialog>
	);
};

export default AchievementDialog;