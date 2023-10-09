import React from 'react';

import levelProgression from "../../../data/levelProgression.json";
import styles from './UserBadge.module.css';

const UserBadge = (props:BadgeProps) => {
	
	const {type, userRole, progressPercentage, level} = props;
	const index = Math.floor((level / 10));
	const rankIndex = (index < levelProgression.length && index >= 0) ? index : 0
	
	function setGradient(expAmount: number) {

		const value = (expAmount - 45) * (100/10);
		const color = levelProgression[rankIndex].color;

		return (
			value !== 0 ? `linear-gradient(to right, ${color} ${value + 1}%, #284566 ${value + 1}%)`: ``
		)
	}

	const genLevelBadge = ():JSX.Element => {
		const isPercentage = type === 'percentage'  && progressPercentage !== undefined;
		const percentageFillStyle =  {background: isPercentage
			? setGradient(progressPercentage) 
			: levelProgression[rankIndex]?.color || "#142D4A"};
		const badgeBg = {background: isPercentage ? "#142D4A" : "transparent"}

		return (
			<div className={`${styles.badge}`} style={percentageFillStyle} data-type={type}>
				<div className={styles.inner} style={badgeBg}>
					<img 
						src={levelProgression[rankIndex]?.logo}
						alt="level logo"
						className={styles.logo}
						height={16}
					/>
					<span>{level}</span>
				</div>
			</div>
		)
	}

	const genRoleBadge = ():JSX.Element => {

		if (userRole != 'admin' && userRole != 'moderator') {
			return genLevelBadge()
		}
		return (
			userRole === 'admin'
				? <span className={`${styles.badge} ${styles.role} ${styles.admin}`}>admin</span>
				: <span className={`${styles.badge} ${styles.role} ${styles.moderator}`}>moderator</span>
		)
	}

	return (
		userRole? genRoleBadge() : genLevelBadge()	
	)
};

interface BadgeProps {
	type: BadgeType,
	/**
	 * user role in chat
	 */
	userRole?: UserRole,
	/**
	 * The filled of percentage of progress bar
	 */
	progressPercentage?: number,
	level: number
	// rankIndex: number
}
export default UserBadge;