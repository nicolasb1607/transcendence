import React, { useContext, useState} from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import UserBadge from '../../common/UserBadge/UserBadge';
import AvatarDialog from './avatarDialog';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from '../../../hooks/useSession';
import { blockRelationInDb, updateRelationInDb } from '../../../services/relation';
import BlockIcon from '@mui/icons-material/Block';
import { useOnlinePlayers } from '../../../hooks/useOnlinePlayers';
import LevelExperience from "../../../data/levelExperience.json";
import levelProgression from "../../../data/levelProgression.json";

import styles from './ProfileCard.module.css';
import { ThemeContext } from '../ThemePicker/theme';

const ProfileCard = (props:ProfileCardProps) => {
	const [isAvatarSelectOpen, setIsAvatarSelectOpen] = useState(false);
	const { theme } = useContext(ThemeContext);
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [session, _, __, updateUserRelation] = useSession();
	const {user, totalGame, win, defeat, edit} = props;
	const onlinePlayersHandler = useOnlinePlayers();

	const level = user?.experience?.level || 0;
	const levelExpMax = LevelExperience[level + 1] || LevelExperience[0];
	const index = Math.floor((level / 10));
	const progressColor = (index < levelProgression.length && index >= 0) 
		? levelProgression[index].color : levelProgression[0].color;
	const sessionAvatar = session ? process.env.API_URL as string + session.avatar : undefined
	const userAvatar = user.ID === session?.ID ? sessionAvatar : process.env.API_URL as string + user.avatar;

	const handleOnClick = async (currentStatus:friendshipStatus, userId:number, targetId:number) => {
		let newStatus:friendshipStatus = 'none';
		if (currentStatus === 'none') {
			newStatus = 'requesting';
		} else if (currentStatus === 'requesting') {
			newStatus = 'none';
		} else if (currentStatus === 'requested') {
			newStatus = 'friend';
		} else if (currentStatus === 'friend') {
			newStatus = 'none';
		} else if (currentStatus === 'blocked') {
			newStatus = 'none';
		}
		const response = await updateRelationInDb(newStatus, userId, targetId); 
		if (!response || "statusCode" in response) {
			return;
		}
		updateUserRelation(newStatus, targetId);
	}

	const handleOnBlock = async (userId:number, targetId:number) => {
		const response = await blockRelationInDb(userId, targetId);
		if (!response || "statusCode" in response) return;
		updateUserRelation('blocked', targetId);
	}

	const genPictureArea = ():JSX.Element => {
		return (
			<div>
				<button id={styles.avatar} onClick={edit ? () => setIsAvatarSelectOpen(true): undefined} data-edit={edit}>
					<img
						id="profileCardImg"
						src={userAvatar || (process.env.API_URL + "avatars/public/order_avatar3.jpg")}
						alt="avatar joueur"
						width={100}
						height={100}
					/>
					<EditIcon id={styles.avatarEditButton} data-edit={edit}/>
				</button>
				{genBackRect()}
				<AvatarDialog 
					open={isAvatarSelectOpen}
					onClose={() => setIsAvatarSelectOpen(false)}
					user={user}
				/>
			</div>
		)
	}


	const getCoaBackground = ():string => {
		const background = {
			"federation" : "/federation_background.jpg",
			"alliance" : "/alliance_background.png",
			"assembly" : "/assembly_background.png",
			"order" : "/order_background.png",
		}
		return (background[theme as Coalition]);
	}
	

	const genBackRect = ():JSX.Element => {
		const playerStatus = onlinePlayersHandler.getPlayerStatus(user.ID);
		const userLogin = user.ID === session?.ID ? session?.login : user.login;
		user.isActive = playerStatus && playerStatus !== 'offline';

		return (
			<div id={styles.backTop}>
				<img src={getCoaBackground()} alt="coalition background" id={styles.backImg}/>
				<div id={styles.playerName}>
					<span className={styles.name}>{userLogin}</span>
					{user.isActive ? <span className={styles.active} data-status={playerStatus}>{playerStatus}</span> : ''}
				</div>
			</div>
		);
	}

	const genExpJauge = ():JSX.Element => {
		const amount: number = (user?.experience?.exp || 0)/levelExpMax * 100
		return (
			<div id= {styles.expJauge}>
				<div id= {styles.expJaugeText}>
					<span>{(user?.experience?.exp) ? user?.experience?.exp : 0}/{levelExpMax} XP</span>
				</div>
				<div id= {styles.bg}>
					<LinearProgress sx={{
						backgroundColor: '#284566',
						borderRadius: '4px',
						height: '8px',
						'& .MuiLinearProgress-bar': {
							backgroundColor: `${progressColor}`
						}
					}}
					variant="determinate"
					value={amount} 
					/>
					<div className={styles.profileBadge}>
						<UserBadge 
							type='percentage'
							progressPercentage={amount}
							level={(user?.experience?.level) ? user.experience.level : 0}
						/>
					</div>
				</div>
			</div>
		);
	}

	const genPlayerStats = (total: number, win: number, defeat: number):JSX.Element => {
		return (
			<div id= {styles.playerStats}>
				<div className={styles.stat}>
					<span className= {styles.singleStatTitle}>Total Games</span>
					<span className= {styles.singleStatCount}>{total}</span>
				</div>
				<hr className={styles.verticalHr}/>
				<div className={styles.stat}>
					<span className= {styles.singleStatTitle}>Defeats</span>
					<span className= {styles.singleStatCount}>{defeat}</span>
				</div>
				<hr className={styles.verticalHr}/>
				<div className={styles.stat}>
					<span className= {styles.singleStatTitle}>Wins</span>
					<span className= {styles.singleStatCount}>{win}</span>
				</div>
			</div>
		);
	}
	const genButtonArea = () => {
		let relationshipStatus:friendshipStatus = "none";
		if (!session?.ID || session?.ID === user.ID) return ;

		for (const [key, value] of Object.entries(session?.relations || {})) {
			if (!value) continue;
			if (value.indexOf(user.ID) !== -1) {
				relationshipStatus = key as friendshipStatus;
			}
		}

		if (session?.ID === user.ID) return (<></>);
		return (
			<div className={styles.buttonSection}>
				<Button 
					className={styles.frienshipButton}
					variant="contained"
					fullWidth
					onClick={() => handleOnClick(relationshipStatus, session.ID, user.ID)}
					data-friendship={relationshipStatus}
				/>
				<Button
					className={styles.blockButton}
					variant="contained"
					onClick={() => handleOnBlock(session.ID, user.ID)}
					title='Block'
				>
					<BlockIcon sx={{color: "rgb(245, 61, 73)"}}/>
				</Button>
			</div>
		);
	}
	
	return (
		<div id={styles.simpleCard}>
			{genPictureArea()}
			<div id={styles.cardBody}>
				<div id={styles.cardContent}>
					{genExpJauge()}
					<hr className={styles.horizontalHr}/>
					{genPlayerStats(totalGame, win, defeat)}
					<hr className={styles.horizontalHr}/>
					<div id= {styles.playerDescription}>
						<p>{user.description}</p>
					</div>
				</div>
				{genButtonArea()}
			</div>
		</div>
	);

};

interface ProfileCardProps {
	user : UserDetails,
	totalGame: number,
	win: number,
	defeat: number,
	edit: boolean,
}

export default ProfileCard;