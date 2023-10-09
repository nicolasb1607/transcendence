import { useContext } from "react";
import { OnlinePlayersContext } from "../context/onlinePlayers";

export const useOnlinePlayers = ():useOnlinePlayersReturn => {
	const onlinePlayerHandler = useContext(OnlinePlayersContext);
	
	const getPlayerStatus = (playerID: number):UserStatus | undefined => {
		return (onlinePlayerHandler?.onlinePlayers?.[playerID]);
	}
	
	return ({
		onlinePlayers: onlinePlayerHandler?.onlinePlayers,
		setOnlinePlayers: onlinePlayerHandler?.setOnlinePlayers,
		getPlayerStatus,
		challengeUser: onlinePlayerHandler?.challengeUser as (challengedID: number, gameType:GameType) => void
	})
}

interface useOnlinePlayersReturn {
	/**
	 * List of online players
	 */
	onlinePlayers: PlayerStatus | undefined;
	/**
	 * Set list of online players
	 */
	setOnlinePlayers: React.Dispatch<React.SetStateAction<PlayerStatus>> | undefined;
	/**
	 * Return current status of a player
	 */
	getPlayerStatus: (playerID: number) => UserStatus | undefined;
	/**
	 * Challenge a user on defined game type
	 * @param challengedID ID of the challenged user
	 * @param gameType Game type to challenge on
	 */
	challengeUser: (challengedID: number, gameType:GameType) => void;
}