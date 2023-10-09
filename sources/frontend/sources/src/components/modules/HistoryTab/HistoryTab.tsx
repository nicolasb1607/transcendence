import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import GameDialog from './GameDialog';
import { fetchUserGamesData } from '../../../services/user';
import { formatDateToFrench } from '../../common/utils/date';

import styles from './HistoryTab.module.css'

interface HistoryTabProps {
	userId: number;
}

interface GameDialog {
	type: BackendGameType;
	open: boolean;
}

const HistoryTable = (props: HistoryTabProps) => {
	const { userId } = props;
	const [gameDialogHandler, setGameDialogHandler] = useState<GameDialog>({type: "classicPong", open: false});
	const [games, setGames] = useState<BackendGame[]>([]);

	useEffect(() => {
		const loadGamesHistory = async () => {
			const history = await fetchUserGamesData(userId);
			setGames(history);
		}
		
		loadGamesHistory();
	}, []);

	

	const gameImages = {
		classicPong: "/classic.svg",
		spatialPong: "/spatialPong.svg"
	}

	const handleRowClick = (type:BackendGameType) =>
		setGameDialogHandler({type, open: true});
	const handleDialogClose = () =>
		setGameDialogHandler({...gameDialogHandler, open: false});

	const genLine = (gameData: BackendGame):JSX.Element => {
		const { ID, type, updatedAt, score, winnerId  } = gameData;
		// const isWinner = players.indexOf(userId)!== -1 && 
		// 	(players[0] === userId ?  score[0] > score[1] : score[1] > score[0]); 
		const isWinner = (userId === winnerId) ? true : false;
		return (
			<div className={styles.row} data-win={isWinner} key={ID}>
				<div>
					<img className={styles.imgTable} width={30} height={30} src={gameImages[type as 'classicPong'|'spatialPong']} alt="" />
					{(type === "classicPong") ? "Classic Pong" : "Spatial Pong"}
					<a href="#" onClick={() => handleRowClick(type)}>
						<img className={styles.imgTable} src={"/icons/historyTabLogo.svg"}  alt='' />
					</a>
				</div>
				<div>{score[0]} - {score[1]}</div>
				<div>{formatDateToFrench(new Date(updatedAt))}</div>
			</div>
		)
	}

	const genGameDialog = ():JSX.Element => {
		return (
			<GameDialog
				type={gameDialogHandler.type === "classicPong" ? "classic" : "spatial"}
				open={gameDialogHandler.open}
				onClose={handleDialogClose}
			/>
		)
	}

	if (games.length === 0) return ("No games history to display");

	return (
		<div id={styles.tableContainer}>
			<Helmet title='Profile | Game History' />
			<div className={styles.table}>
				<div id={styles.tableHeader}>
					<div>Game</div>
					<div>Score</div>
					<div>Date</div>
				</div>
				<div id={styles.historyRows} className={styles.customSb}>
					{games.map((game) => genLine(game))}
				</div>
				{genGameDialog()}
			</div>
		</div>
	)
}

export default HistoryTable;