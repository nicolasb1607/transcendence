import React from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useOnlinePlayers } from '../../../hooks/useOnlinePlayers';

import styles from './ChallengeUserDialog.module.css';
import gameInfos from "../../../data/gameInfos.json";

const PickGameDialog = (props: PickGameDialogProps) => {
	const { open, onClose, challengedUserId } = props;
	const {challengeUser} = useOnlinePlayers();

	const handleClick = (key:GameType) => {
		if (!challengedUserId) return ;
		challengeUser(challengedUserId, key);
		onClose();
	}

	const genGameCard = (name:string, logo:string, key:GameType) => {
		if (!challengedUserId) return ;
		return (
			<button key={name} className={styles.gameCard} onClick={() => handleClick(key)}>
				<img className={styles.gameLogo} src={logo} alt={name} width={56} height={56} />
				<span className={styles.gameName}>{name}</span>
			</button>
		)
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			id={styles.pickDialog}
		>
			<DialogContent id={styles.dialog}>
				<span id={styles.title}>Pick the game!</span>
				<span id={styles.subTitle}>Choose your pong adventure</span>
				<div className={styles.gameList}>
					{Object.keys(gameInfos).map((gameName) => {
						const game = gameInfos[gameName as GameType];
						return genGameCard(game.name, game.logo, gameName as GameType);
					})}
				</div>
			</DialogContent>
			<DialogActions id={styles.actions}>
				<Button
					onClick={onClose}
					variant='contained'
					color='error'
				>CANCEL</Button>
			</DialogActions>
		</Dialog>
	);
};

interface PickGameDialogProps {
	open: boolean;
	onClose: () => void;
	challengedUserId: number|null;
}

export default PickGameDialog;