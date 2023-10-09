import React, { useContext, useState } from "react";
import { Button, ClickAwayListener } from "@mui/material";
import { navigate } from "wouter/use-location";
import PickGameDialog from "../Challenge/PickGameDialog";

import style from "./CardMenu.module.css";
import { launchConversation } from "../../common/utils/launchConversation";
import { ChannelContext } from "../../layouts/tchat/currentChannel.context";

const CardMenu = (props: CardMenuProps) => {
	const { currentPageUserId, cardUserId, isMenuOpen, setIsMenuOpen, onBlock } = props;
	const [isSelectingChallenge, setIsSelectingChallenge] = useState<boolean>(false);
	const channelHandler = useContext(ChannelContext);

	const handleMessageClick = () => {
		launchConversation({
			type: "userId",
			value: cardUserId,
		}, channelHandler, currentPageUserId);
		setIsMenuOpen(false);
	}

	if (!isMenuOpen) return (<></>);
	return (
		<>
			<ClickAwayListener onClickAway={() => setIsMenuOpen(false)}>
				<div className={style.menu}>
					<Button
						className={style.menuOptionButton}
						onClick={() => {
							navigate(`/profile/${cardUserId}`)
							setIsMenuOpen(false);
						}}
					>
						Profile
					</Button>
					<Button className={style.menuOptionButton} onClick={() => setIsSelectingChallenge(true)}>
						Challenge
					</Button>
					<Button className={style.menuOptionButton} onClick={handleMessageClick}>
						Message
					</Button>
					<hr className={style.hrBlockButton} />
					<Button
						className={style.menuBlockButton}
						onClick={() => {
							setIsMenuOpen(false);
							onBlock("blocked", currentPageUserId, cardUserId);
						}}
					>
						Block
					</Button>
				</div>
			</ClickAwayListener>
			<PickGameDialog
				open={isSelectingChallenge}
				onClose={() => setIsSelectingChallenge(false)}
				challengedUserId={cardUserId}
			/>
		</>
	)
}

interface CardMenuProps {
	currentPageUserId: number;
	cardUserId: number;
	isMenuOpen: boolean;
	setIsMenuOpen: (isOpen: boolean) => void;
	onBlock: (newStatus: friendshipStatus, currentPageUserId: number, targetId: number) => void;
}

export default CardMenu;
