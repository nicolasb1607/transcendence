import React, { createContext, useContext, useEffect, useState } from "react";
import AchievementDialog from "../components/modules/Achievements/AchievementDialog";
import { disconnectSocket, initSocket, userSocket } from "../services/usersSocket";
import { acceptChallenge, getChallenge, getUsersStatus, updateUserStatus } from "../services/user";
import { useLocation } from "wouter";
import ChallengeUserDialog from "../components/modules/Challenge/ChallengeUserDialog";
import { useSnackbar } from "notistack";
import { Session } from "../components/modules/auth/session/session";
import { Helmet } from "react-helmet";

export const OnlinePlayersContext = createContext<OnlinePlayersCtx>({
	onlinePlayers: [],
	challenge: null,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setOnlinePlayers: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setChallenge: () => {},
	challengeUser: null
});

/**
 * Handle state of online players
 * Also manage challenge
 * @emit connection and disconnection of current user
 */
const OnlinePlayersProvider = (props:OnlinePlayersProviderProps) => {
	const [onlinePlayers, setOnlinePlayers] = useState<PlayerStatus>([]);
	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const sessionHandler = useContext(Session);
	const session = sessionHandler?.authUser.session;
	const { enqueueSnackbar } = useSnackbar();
	const [location, navigate] = useLocation();

	useEffect(() => {
		const onUpdateStatus = (playerStatus: PlayerStatusUpdate) => {
			setOnlinePlayers((prevPlayers) => {
				const newPlayers = [...prevPlayers];
				const player = newPlayers[playerStatus.userId];
				if (!player) return (prevPlayers);
				newPlayers[playerStatus.userId] = playerStatus.status;
				return (newPlayers);
			});
		}
		
		initSocket();
		if (!userSocket) return ;
		userSocket.on('updateStatus', onUpdateStatus);
		
		return () => {
			userSocket.off('updateStatus', onUpdateStatus);
		}
	}, [session]);

	useEffect(() => {
		if (!session?.ID) return ;
		initSocket();
		let intervalId: NodeJS.Timeout;

		const loadPlayersStatus = async () => {
			setOnlinePlayers(await getUsersStatus());
		}

		const refresh = () => {
			clearInterval(intervalId);
			intervalId = setInterval(() => {
				updateUserStatus("online");
				refresh();
			}, 20 * 60 * 1000);//every 20 minutes
		}

		const onChallenge = (challenge: userChallenge, challenger:UserDetails) => {
			if (challenge === null || !session?.ID) return;
			if (challenge.challenger === session?.ID) {
				enqueueSnackbar('Challenge sent', { variant: 'info' });
			}
			setChallenge([challenge, challenger]);
		}

		const onChallengeAccept = (challenge: userChallenge, gameId:number) => {
			enqueueSnackbar('Challenge accepted', { variant: 'success' });
			setChallenge(null);
			const gameType = challenge.gameType === 'classic' ? 'classic' : 'spatialPong';
			navigate(`/pong/${gameType}?gameId=${gameId}`);
		}

		const onChallengeDecline = () => {
			enqueueSnackbar('Challenge declined', { variant: 'info' });
			setChallenge(null);
		}

		const onCancelChallenge = () => {
			enqueueSnackbar('Challenge canceled', { variant: 'info' });
			setChallenge(null);
		}

		const onUserSessionUpdate = (user:UserSession, notification?:string) => {
			if (!session?.ID) return ;
			sessionHandler?.setAuthUser({
				refresh: false,
				isLoading: false,
				session: user
			});
			if (notification) enqueueSnackbar(notification, { variant: 'info' });
		}

		const onException = (exception: NestError) => {
			enqueueSnackbar(exception.message, { variant: 'error' });
		}

		refresh();
		loadPlayersStatus()
		if (!userSocket) return ;
		userSocket.on('challenge', onChallenge);
		userSocket.on('challenge.accept', onChallengeAccept);
		userSocket.on('challenge.decline', onChallengeDecline);
		userSocket.on('challenge.cancel', onCancelChallenge)
		userSocket.on('userSessionUpdate', onUserSessionUpdate);
		userSocket.on('exception', onException);
		return () => {
			userSocket.off('challenge', onChallenge);
			userSocket.off('challenge.accept', onChallengeAccept);
			userSocket.off('challenge.decline', onChallengeDecline);
			userSocket.off('challenge.cancel', onCancelChallenge)
			userSocket.off('exception', onException);
			console.log('disconnecting socket')
			disconnectSocket();
			clearInterval(intervalId);
		}
	}, [session]);

	useEffect(() => {
		if (!location.startsWith('/pong/')) return ;
		const loadUserChallenge = async () => {
			const challenges = await getChallenge();
			if (!challenges || challenges.length === 0) return ;
			challenges[0][0].createdAt = challenges[0][0]?.createdAt  ? new Date(challenges[0][0].createdAt) : undefined;
			setChallenge(challenges[0]);
		}
		loadUserChallenge();
	}, [location]);

	const genInfoFavicon = () => {
		const favicon = challenge && challenge[0]?.challenged === session?.ID ? '/favicon_alert.png' : '/favicon.png?v=2';
		return (
			<Helmet>
				<link rel="icon" href={favicon} />
			</Helmet>
		)
	}

	const handleResponseError = (response: NestError) => {
		enqueueSnackbar(response.message, { variant: 'error' });
	}

	const handleReject = async () => {
		if (challenge === null) return ;
		const response = await acceptChallenge(challenge[0].challenger, false)
		if (response && "error" in response) handleResponseError(response);
		setChallenge(null)
	}

	const handleAccept = async () => {
		if (challenge === null) return ;
		console.log(challenge[0].gameType)
		const response = await acceptChallenge(challenge[0].challenger)
		if (!response || !("error" in response)) return ;
		handleResponseError(response);
		setChallenge(null)
	}

	const challengeUser = (challengedID: number, gameType:GameType) => {
		if (!userSocket) return ;
		userSocket.emit('user.challenge', {
			userId: challengedID,
			gameType
		});
	}

	return (
		<OnlinePlayersContext.Provider value={{ onlinePlayers, setOnlinePlayers, challenge, setChallenge, challengeUser }}>
			{genInfoFavicon()}
			<ChallengeUserDialog
				open={challenge !== null && challenge[0].challenger != session?.ID}
				challenge={challenge !== null ? challenge[0] : null}
				challenger={challenge !== null ? challenge[1] : null}
				onReject={handleReject}
				onAccept={handleAccept}
			/>
			{props.children}
			<AchievementDialog/>
		</OnlinePlayersContext.Provider>
	)
}

interface OnlinePlayersProviderProps {
	children: React.ReactNode;
}

export default OnlinePlayersProvider;