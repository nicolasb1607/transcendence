import React, { useEffect, useRef, useState } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TchatRow from './TchatRow';
import ProfilPopOver from './ProfilPopOver';

import styles from './Tchat.module.css';
import TchatInputArea from './TchatInputArea';
import EditUser from './EditUser';
import { banUser, kickUser, muteUser } from '../../../services/chat';
import { useSnackbar } from 'notistack';
import { useSession } from '../../../hooks/useSession';

interface selectedProfil {
	ref: React.RefObject<HTMLDivElement> | null;
	user: Participant | undefined;
}

const ChatMessages = (props: ChatMessagesProps) => {
	const { chatData, sendMessage, currentUserId, openConversation } = props;
	const [session] = useSession();
	const [notSeenMessages, setNotSeenMessages] = useState<number>(0);
	const [selectedProfil, setSelectedProfil] = useState<selectedProfil>({ ref: null, user: undefined });
	const [editUser, setEditUser] = useState<Participant | undefined>(undefined);
	const { enqueueSnackbar } = useSnackbar();
	
	const chatMessagesRef = useRef<HTMLUListElement>(null);
	const isFirstRenderRef = useRef<boolean>(true);
	const currentUserInParticipants = chatData?.participants?.find((participant) => participant.ID === currentUserId);

	useEffect(() => {

		const handleTchatScroll = () => {
			if (!chatMessagesRef.current) return;
			const chat = chatMessagesRef.current;
			if (chat.scrollTop === chat.scrollHeight - chat.clientHeight) {
				setNotSeenMessages(0);
			}
		};

		chatMessagesRef.current?.addEventListener("scroll", handleTchatScroll);

		return () => {
			chatMessagesRef.current?.removeEventListener("scroll", handleTchatScroll);
		}
	}, []);

	useEffect(() => {
		const chat = chatMessagesRef.current;

		/**
		 * If user is more than 150px from bottom of chat
		 * display a button to scroll to bottom
		 * else, scroll to bottom
		 */
		const displayNotSeenAlert = () => {
			if (!chat || !chatData?.messages?.length) return;
			if (chat.scrollTop + chat.clientHeight + 250 < chat.scrollHeight) {
				setNotSeenMessages((prev) => prev + 1);
			} else {
				scrollToBottom();
			}
		};

		displayNotSeenAlert();
		if (isFirstRenderRef.current && chatData?.messages?.length) {
			scrollToBottom();
			isFirstRenderRef.current = false;
			return;
		}
		//if new message is from current user, scroll to bottom
	}, [chatData?.messages]);

	const scrollToBottom = () => {
		if (!chatMessagesRef.current) return;
		chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		setNotSeenMessages(0);
	}

	const genDisconnected = () => {
		return (
			<div id={styles.disconnected}>
				<b>Currently disconnected</b>
				<span>Trying to reconnect...</span>
			</div>
		)
	}

	const genNotSeenMessages = () => {
		if (notSeenMessages === 0) return;
		const plural = notSeenMessages > 1 ? "s" : "";
		return (
			<button id={styles.notSeen} onClick={scrollToBottom}>
				<span>{notSeenMessages} New message{plural}</span>
				<ArrowDownwardIcon />
			</button>
		)
	}

	const genSnackBar = (action:PopOverSnackbarActions, success:boolean, user:Participant) => {
		const messages:Record<PopOverSnackbarActions,string[]> = {
			ban: user.isBan ? [
				`Failed to unban ${user.login}`,
				`Successfully unbanned ${user.login}`
			] : [
				`Failed to ban ${user.login}`,
				`Successfully banned ${user.login}`
			],
			kick: [
				`Failed to kick ${user.login}`,
				`Successfully kicked ${user.login}`
			],
			mute: user?.muteEnd && +new Date(user.muteEnd) > +new Date() ? [
				`Failed to unmute ${user.login}`,
				`Successfully unmuted ${user.login}`
			] : [
				`Failed to mute ${user.login}`,
				`Successfully muted ${user.login} for 48h`
			],
		}
		enqueueSnackbar(messages[action][Number(success)], {
			variant: success ? "success" : "error"
		});
	}

	const handleActions = async (action:PopOverActions, user:Participant) => {
		if (!chatData) return;
		switch (action) {
		case "ban":
			const confirm = window.confirm(`Are you sure to continue your action against ${user.login} ?`);
			if (!confirm) return;
			genSnackBar("ban", await banUser(chatData.ID, user.ID), user);
			break;
		case "kick":
			genSnackBar("kick", await kickUser(chatData.ID, user.ID), user);
			break;
		case "edit":
			setEditUser(selectedProfil.user);
			break;
		case "message":
			openConversation(user.ID);
			break;
		case "mute":
			genSnackBar("mute", await muteUser(chatData.ID, user.ID), user);
			break;
		}
	}

	const handleProfilePopOverClose = (action?:PopOverActions) => {
		if (!selectedProfil.user) return;
		if (action) handleActions(action, selectedProfil.user);
		setSelectedProfil({ ref: null, user:undefined })
	}

	const handleEditUserClose = (action?:PopOverActions) => {
		if (action && editUser) handleActions(action, editUser);
		setEditUser(undefined);
	}

	return (
		<>
			<ul id={styles.tchatMessages} ref={chatMessagesRef}>
				{chatData?.messages ? chatData.messages.map((message) => {
					const user = chatData.participants.find(user => user.ID === message.emitterId);
					if (user && session?.relations.blocked.includes(user.ID)) return null;
					if (message.emitterId === 0) return (
						<li key={message.ID} className={styles.systemMessage}>
							{message.content}
						</li>
					)
					if (!user) return null;

					return (
						<TchatRow
							key={message.ID}
							message={message.content}
							user={user}
							onProfileClick={(messageRef, user) => setSelectedProfil({ ref: messageRef, user })}
						/>
					);
				}) : genDisconnected()}
				{genNotSeenMessages()}
				<ProfilPopOver
					messageRef={selectedProfil.ref}
					selectedUser={selectedProfil.user}
					onClose={handleProfilePopOverClose}
					isAdmin={currentUserInParticipants?.channelRole === "admin"}
					isOwner={currentUserId === chatData?.ownerId}
					isMe={currentUserInParticipants?.ID === selectedProfil.user?.ID}
				/>
				{(currentUserInParticipants?.channelRole === "admin" || currentUserId === chatData?.ownerId) && editUser ? (
					<EditUser 
						user={editUser}
						isOpen={Boolean(editUser)}
						onClose={handleEditUserClose}
						channelId={chatData?.ID || 0}
					/>
				) : null}
			</ul>
			<TchatInputArea
				onSend={sendMessage}
			/>
		</>
	);
};

interface ChatMessagesProps {
	chatData: Chat|null;
	sendMessage: (message: string) => void;
	openConversation: (userId: number) => void;
	currentUserId: number;
}

export default ChatMessages;