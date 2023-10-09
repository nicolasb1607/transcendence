import React from 'react';
import { Avatar, Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import UserBadge from '../../common/UserBadge/UserBadge';

import styles from './ChallengeUserDialog.module.css';
import gameInfos from "../../../data/gameInfos.json";
import levelProgression from '../../../data/levelProgression.json';

const ChallengeUserDialog = (props: ChallengeUserDialogProps) => {
	const { open, challenge, challenger, onReject, onAccept } = props;
	const isOpen = open && challenge !== null && challenger !== null;
	const game = gameInfos[challenge?.gameType || 'classic'];
	
	const genUserRow = () => {
		if (!isOpen) return ;
		const userAvatar = "avatar" in challenger && typeof challenger.avatar !== 'undefined' ? (
			process.env.API_URL + challenger.avatar
		) : process.env.API_URL + "avatars/order_avatar3.jpg";
		const experience = "experience" in challenger ? challenger.experience : {level: 0, exp: 0};
		const levelColor = levelProgression[Math.floor(((experience?.level || 0) / 10))].color;
		
		return (
			<div className={styles.userRow}>
				<Avatar id={styles.avatar} src={userAvatar} sx={{ width: 56, height: 56 }} />
				<div id={styles.userInfos}>
					<span className={styles.username} style={{color: levelColor}}>
						{challenger.login}
					</span>
					<UserBadge
						level={experience?.level || 0}
						type="filled"
					/>
				</div>
				<img className={styles.gameLogo} src={game.logo} alt={game.name} />
			</div>
		)
	}

	const challengerLogin = challenger?.login || '';

	return (
		<Dialog
			open={isOpen}
			onClose={() => {1}}
			maxWidth="sm"
		>
			<DialogContent id={styles.dialog}>
				<span id={styles.title}>{challengerLogin} wants to challenge you on {game.name}!</span>
				{genUserRow()}
			</DialogContent>
			<DialogActions id={styles.actions}>
				<Button
					onClick={onReject}
					variant='contained'
					color='error'
				>REJECT</Button>
				<Button
					onClick={onAccept}
					variant='contained'
					color='success'
				>ACCEPT</Button>
			</DialogActions>
		</Dialog>
	);
};

interface ChallengeUserDialogProps {
	open: boolean;
	challenge: userChallenge|null;
	challenger: UserDetails|null;
	onReject: () => void;
	onAccept: () => void;
}

export default ChallengeUserDialog;