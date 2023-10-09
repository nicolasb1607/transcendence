import React, { useContext } from 'react';

import styles from './Tchat.module.css';
import { Session } from '../../modules/auth/session/session';

const fallbackAvatar = process.env.API_URL + 'avatars/public/avatar1.jpg'

const PrivateConvRow = (props: PrivateConvRowProps) => {
	const sessionHandler = useContext(Session);
	const { channel, userId, onClick, isNew } = props;
	const targetUser = channel.participants.find((user) => user.ID !== userId);
	let lastMessage:Message|undefined = channel.messages[channel.messages.length - 1];
	const targetUserAvatar = targetUser?.avatar && process.env.API_URL ? process.env.API_URL + targetUser.avatar : fallbackAvatar;
	const isBlocked = sessionHandler?.authUser?.session?.relations?.blocked?.indexOf(targetUser?.ID || 0) !== -1;
	if (isBlocked) lastMessage = undefined;

	/**
	 * Return the duration between the last message and now
	 * - If under 1 minute, return 'now'
	 * - If under 1 hour, return 'x minutes ago'
	 * - If under 1 day, return 'x hours ago'
	 * - If under 1 week, return 'day'
	 * - else 'dd/mm/yyyy'
	 */
	const getLastMessageTime = () => {
		if (!lastMessage?.createdAt) return ('')
		const lastMessageDate = new Date(lastMessage?.createdAt || 0);
		const now = new Date();
		const diff = now.getTime() - lastMessageDate.getTime();
		const diffInMinutes = Math.floor(diff / 1000 / 60);
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInMinutes < 1) return 'now';
		if (diffInMinutes < 60) return `${diffInMinutes}m`;
		if (diffInHours < 24) return `${diffInHours}h`;
		if (diffInDays < 7) return `${diffInDays}d`;
		let date = `${lastMessageDate.getDate()}`.padStart(2, '0');
		date += '/' + `${lastMessageDate.getMonth()}`.padStart(2, '0');
		date += '/' + `${lastMessageDate.getFullYear()}`;
		return date;
	}

	const genAvatar = () => (
		<div className={styles.avatar}>
			<img src={targetUserAvatar} alt="other user avatar" width={52} height={52} />
		</div>
	)

	const handleClick = () => onClick({
		type: isNew ? 'userId' : 'channelId',
		value: isNew ? (targetUser?.ID || 0) : channel.ID
	});

	return (
		<div
			className={styles.privateConvRow}
			onClick={handleClick}
			onKeyDown={handleClick}
			role="button"
			tabIndex={0}
		>
			{genAvatar()}
			<div className={styles.privateConvRowContent}>
				<div className={styles.privateConvRowHead}>
					<span>{targetUser?.login}</span>
					<span>{getLastMessageTime()}</span>
				</div>
				<span>{lastMessage?.content}</span>
			</div>
		</div>
	);
};

interface PrivateConvRowProps {
	channel: Chat;
	userId: number;
	onClick: (event:userPrivateClickEvent) => void;
	isNew?: boolean;
}

export default PrivateConvRow;