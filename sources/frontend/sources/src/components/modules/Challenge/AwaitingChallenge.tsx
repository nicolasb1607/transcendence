import React, { useContext } from 'react';

import styles from '../../../pages/Game/Game.module.css';
import { OnlinePlayersContext } from '../../../context/onlinePlayers';
import { useSession } from '../../../hooks/useSession';
import Countdown from '../../common/countdown';
import { Button } from '@mui/material';
import { cancelChallenge } from '../../../services/user';

const COUNTDOWN_EXPIRATION = 5 * 60 * 1000;

const AwaitingChallenge = () => {
	const onlinePlayers = useContext(OnlinePlayersContext);
	const [session] = useSession();

	const handleCancel = () => cancelChallenge();

	if (!onlinePlayers?.challenge?.[0]) return;
	if (!session?.ID) return;
	if (onlinePlayers.challenge[0].challenger !== session.ID) return;
	return (
		<div id={styles.awaitingChallenge}>
			<div id={styles.awaitingChallengeContent}>
				<h1>Waiting for opponent to accept invitation</h1>
				{onlinePlayers.challenge[0]?.createdAt && onlinePlayers.challenge[0].createdAt.getTime() + COUNTDOWN_EXPIRATION > Date.now() ? (
					<Countdown
						endDate={new Date(onlinePlayers.challenge[0].createdAt.getTime() + COUNTDOWN_EXPIRATION)}
					/>
				) : undefined}
				<Button
					onClick={handleCancel}
					variant="contained"
					color="error"
					sx={{ fontWeight: 'bold', width: 'fit-content' }}
				>Cancel Challenge</Button>
			</div>
		</div>
	);
};
export default AwaitingChallenge;