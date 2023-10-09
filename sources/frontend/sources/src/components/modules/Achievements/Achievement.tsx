import React, { useEffect, useState } from 'react';
import { fetchUserAchievements } from '../../../services/user';

import achievements from '../../../data/achievements.json'
import styles from './Achievement.module.css';
import { Tooltip } from '@mui/material';
import { Helmet } from 'react-helmet';

const achievementsImagePath = '/achievements/'
const badges = achievements.badges as Achievement[];

const Achievement = (props: AchievementProps) => {
	const [achievements, setAchievements] = useState<UserAchievement[]|undefined|null>(undefined);
	const { userId } = props;

	useEffect(() => {

		const loadUserAchievements = async () => {
			const response = await fetchUserAchievements(userId);
			if (response) {
				setAchievements(badges.map((badge):UserAchievement => {
					return ({
						...badge,
						owned: response.find((userAchievementId) => userAchievementId === badge.id) !== undefined
					});
				}).filter((achievement) => {
					if (achievement.parent && achievement.parent !== 0) {
						const isParentOwned = response.includes(badges[achievement.parent].id);
						if (isParentOwned) return false;
						return true;
					}
					return (true);
				})
					.sort((a, b) => {
						if (a.owned && !b.owned) return -1;
						if (!a.owned && b.owned) return 1;
						return (a.id - b.id);
					}));
			} else setAchievements(null);
		}

		loadUserAchievements();
	}, []);

	const genAchievement = (achievement: UserAchievement) => {
		if (!achievement?.image || achievement.image === "") return;
		return (
			<Tooltip title={achievement.description} key={achievement.id}>
				<div className={styles.achievement} key={achievement.id} data-owned={achievement.owned}>
					<img src={achievementsImagePath + achievement.image} alt={achievement.name} />
					<span>{achievement.name}</span>
				</div>
			</Tooltip>
		)
	}

	return (
		<div id={styles.achievements}>
			<Helmet title='Profile | Achievements' />
			{achievements ? 
				achievements.map((achievement) => genAchievement(achievement)) : ""}
		</div>
	);
};

interface AchievementProps {
	userId: number;
}

export default Achievement;