import React, { useState} from "react";
import { Button } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AvatarInteractive from "../../common/avatarInteractive/avatarInteractive";
import CardMenu from "./CardMenu";
import { useSession } from "../../../hooks/useSession";
import { navigate } from "wouter/use-location";
import { useOnlinePlayers } from "../../../hooks/useOnlinePlayers";

import style from "./FriendCard.module.css";

const FriendCard = (props: FriendCardProps):JSX.Element => {

	const {currentPageId, cardRelation, onUserRelationUpdate} = props;

	const [session] = useSession();
	const onlinePlayersHandler = useOnlinePlayers();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const playerStatus = onlinePlayersHandler.getPlayerStatus(cardRelation.ID);
	const isActive = (
		playerStatus  === "online" || playerStatus == "inGame"
	) ? true : false;



	const updateFrienshipStatusButton = () => {
		if (!cardRelation.ID) return;
		if (cardRelation.friendship === "friend")
			onUserRelationUpdate("none", currentPageId, cardRelation.ID);
		else if (cardRelation.friendship === "requesting")
			onUserRelationUpdate("none", currentPageId, cardRelation.ID);
		else if (cardRelation.friendship === "requested")
			onUserRelationUpdate("friend", currentPageId, cardRelation.ID);
		else if (cardRelation.friendship === "blocked")
			onUserRelationUpdate("none", currentPageId, cardRelation.ID);
		else if (cardRelation.friendship === "none")
			onUserRelationUpdate("requesting", currentPageId, cardRelation.ID);
	}
	

	const genInteractiveButton = () => {
		return ((session?.ID == currentPageId) ?
			<>
				<Button 
					className={style.frienshipButton}
					variant="outlined"
					data-friendship={cardRelation.friendship}
					onClick={updateFrienshipStatusButton}
				/>
				<CardMenu 
					currentPageUserId={currentPageId}
					cardUserId={cardRelation.ID}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
					onBlock={onUserRelationUpdate}
				/>
			</> 
			: 
			<Button 
				className={style.frienshipButton}
				variant="outlined"
				data-friendship="consulting"
				onClick={() => navigate(`/profile/${cardRelation.ID}`)}
			/>
		)
	}

	
	return (
		<div className={style.container}>
			{
				(session?.ID == currentPageId) ?
					<Button className={style.menuButton} onClick={() => setIsMenuOpen(true)}>
						<MoreVertIcon />
					</Button>
					: <></>
			}
			<AvatarInteractive user={cardRelation as UserDetails} />
			<div className={style.pseudoSection}>
				<p className={style.pseudo}>{cardRelation.login}</p>
				<span className={style.dot} data-isactive={isActive}/>
			</div>
			{genInteractiveButton()}
		</div>
	)

}



interface FriendCardProps {
	currentPageId: number;
	cardRelation: Friend;
	onUserRelationUpdate: (newStatus:friendshipStatus, currentPageUserId:number, targetIs:number) => void;
}

export default FriendCard;