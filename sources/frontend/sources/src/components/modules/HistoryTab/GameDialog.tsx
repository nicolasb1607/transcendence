import React from 'react';
import Dialog from '../../common/dialog/dialog';
import { Button } from '@mui/material';
import { useLocation } from 'wouter';

import GameDesc from '../../../data/gameDesc.json';
import GameInfos from '../../../data/gameInfos.json';
import styles from './HistoryTab.module.css'

const GameDialog = (props: GameDialogProps) => {
	const { open, onClose, type } = props;
	const [, setLocation] = useLocation();

	const description = GameDesc[type];
	const infos = GameInfos[type];

	const genGameImage = ():JSX.Element => (
		<div id={styles.gameImage}>
			<img
				style={{
					objectFit: "contain"
				}}
				width={180}
				height={180}
				src={infos.logo}
				alt={`${infos.name} logo`}
			/>
		</div>
	);

	const handlePlayGame = () => {
		setLocation(infos.link);
		onClose();
	}

	return (
		<Dialog
			title={infos.name}
			open={open}
			onClose={onClose}
			buttons={
				<>
					<Button onClick={onClose} variant="outlined">Cancel</Button>
					<Button onClick={handlePlayGame} variant="contained">Play</Button>
				</>
			}
			leftElement={genGameImage()}
			dialogProps={{
				id: styles.dialog,
				maxWidth: "md"
			}}
		>
			<p className={styles.customSb}>{description}</p>
		</Dialog>
	);
};

interface GameDialogProps {
	open: boolean;
	onClose: () => void;
	type: GameType;
}

export default GameDialog;