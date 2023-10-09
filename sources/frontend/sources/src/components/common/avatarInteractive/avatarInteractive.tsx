import React from "react";
import rankData from '../../../data/levelProgression.json'

import style from "./avatarInteractive.module.css";

const AvatarInteractive = (props: AvatarInteractiveProps) => {
	const { experience } = props.user;
	const level = experience?.level || 0;
	const rankInfo = rankData[Math.floor(level / 10)] || undefined;
	const userAvatar = props.user?.avatar ? process.env.API_URL + props.user.avatar : null;
	const genRankIcon = () => {
		if (!rankInfo) return ;
		return (
			<div className={style.rankIcon} style={{backgroundColor: rankInfo.color}}>
				<img src={rankInfo.logo}  alt="iconRank" />
			</div>
		)
	}

	return (
		<div className={style.avatar}>
			<img
				id={style.avatarImg}
				src={userAvatar || process.env.API_URL + "/avatars/order_avatar3.jpg"}
				alt="friend_avatar" 
				width={100}
				height={100}
				style={{borderColor: rankInfo?.color }}
			/>
			{genRankIcon()}
		</div>
	)
}

interface AvatarInteractiveProps {
	user: UserDetails;
}

export default AvatarInteractive;
