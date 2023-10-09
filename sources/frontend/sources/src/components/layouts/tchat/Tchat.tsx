import React, { useContext, useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import GroupsIcon from '@mui/icons-material/Groups';
import useChat from '../../../hooks/useChat';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { Tabs, Tab, Fab } from '@mui/material';
import ChatMessages from './ChatMessages';
import { useSession } from '../../../hooks/useSession';
import PrivateConversations from './PrivateConversations';
import LogoutIcon from '@mui/icons-material/Logout';
import { ChannelContext } from './currentChannel.context';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import { launchConversation } from '../../common/utils/launchConversation';
import { useSnackbar } from 'notistack';

import styles from './Tchat.module.css';

const Tchat = () => {
	const [isOpen, setIsOpen] = useState<boolean>(true);
	const channelHandler = useContext(ChannelContext);
	const [user] = useSession();
	const [chatDisplay, setChatDisplay] = useState<displayedChatType>('general');
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		return () => {
			document.body.classList.remove('fullWidth');
		}
	}, [])

	const handleChatException = (error: NestError) => {
		if (['You are not allowed to send messages in this channel'].includes(error.message)) {
			enqueueSnackbar("You are currently mute", { variant: 'error' });
		}
		console.log(error);
	}

	const { data: chatData, sendMessage } = useChat({
		channelId:channelHandler.channelId,
		onError: handleChatException,
	});

	const handleTabChange = (_: React.SyntheticEvent, newValue: displayedChatType) => {
		if (newValue === "general") {
			channelHandler.setChannelId(0);
		}
		setChatDisplay(newValue);
	}

	useEffect(() => {
		setChatDisplay(channelHandler.channelId === 0 ? "general" : "private");
	}, [channelHandler.channelId])

	const genTabs = () => (
		<Tabs
			aria-label="select type of message"
			variant='fullWidth'
			id={styles.tabs}
			value={chatDisplay}
			onChange={handleTabChange}
		>
			<Tab
				label="General"
				aria-controls='general-tchat'
				icon={<QuestionAnswerIcon />}
				iconPosition="start"
				value={'general'}
			/>
			<Tab
				label="Private"
				aria-controls='private-tchat'
				icon={<GroupsIcon />}
				iconPosition="start"
				value={'private'}
			/>
		</Tabs>
	)

	const handleClose = () => {
		document.body.classList.add('fullWidth');
		setIsOpen(false);
	}

	const handleOpen = () => {
		document.body.classList.remove('fullWidth');
		setIsOpen(true);
	}

	const genHead = () => {
		const name = chatData?.type === "conversation" ? (
			`${chatData.participants.find((u) => u.ID !== user?.ID)?.login} (private)`
		) : chatData?.name;
		return (
			<>
				<div id={styles.tchatHead}>
					<div id={styles.tchatHeadTitle}>
						{name}
					</div>
					<div id={styles.onlinePeople}>
						{channelHandler.channelId !== 0 ? (
							<LogoutIcon
								onClick={() => channelHandler.setChannelId(0)}
								titleAccess='Return to conversation'
							/>
						) : null}
						<GroupsIcon />
						<span>{chatData?.participants ? chatData.participants.length : 0}</span>
						<CloseIcon onClick={handleClose} id={styles.closeIcon} />
					</div>
				</div>
				{genTabs()}
			</>
		);
	}

	/* const handleConversationSelected = async (event:userPrivateClickEvent) => {
		if (event.type === "channelId") {
			channelHandler.setChannelId(event.value)
		} else {
			const newConversation = await fetchPrivateChannel(user?.ID || 0, event.value);
			if (!newConversation) return;//throw error or display it ?
			channelHandler.setChannelId(newConversation.ID);
		}
	} */

	const genTchatContent = () => {
		const userId = user?.ID || 0;
		if (chatDisplay === 'general'
			|| chatDisplay === 'private' && channelHandler.channelId !== 0) {
			return (
				<ChatMessages
					chatData={chatData}
					sendMessage={sendMessage}
					openConversation={(targetId) => launchConversation({
						type:"userId", value:targetId
					}, channelHandler, userId)}
					currentUserId={userId}
				/>
			)
		} else if (chatDisplay === 'private' && channelHandler.channelId === 0) {
			return (
				<PrivateConversations
					userId={userId}
					onConversationSelected={(event) => launchConversation(event,
						channelHandler, userId)}
				/>
			)
		}
	}

	return (
		<>
			<Drawer
				anchor='right'
				open={isOpen}
				onClose={() => setIsOpen(false)}
				onPointerEnter={() => setIsOpen(true)}
				variant='persistent'
				sx={{
					'& .MuiDrawer-paper': {
						borderLeft: 'none',
					},
					'& .MuiPaper-root': {
						backgroundColor: "unset"
					}
				}}
			>
				<div id={styles.tchatContainer}>
					<div id={styles.tchat}>
						{genHead()}
						{genTchatContent()}
					</div>
				</div>
			</Drawer>
			{!isOpen ? (
				<Fab
					id={styles.fab}
					color="secondary"
					aria-label="open chat"
					size="medium"
					onClick={handleOpen}
				>
					<ChatIcon />
				</Fab>
			) : undefined}
		</>
	);
};

export default Tchat;