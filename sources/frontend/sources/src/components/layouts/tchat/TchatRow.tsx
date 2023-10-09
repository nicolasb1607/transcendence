import React, { useRef } from 'react';
import UserBadge from '../../common/UserBadge/UserBadge';

import styles from './Tchat.module.css';
import { useSession } from '../../../hooks/useSession';

const fallbackAvatar = "/Leonardo.jpg";

const TchatRow = (props: TchatRowProps) => {
	const { user, message, onProfileClick } = props;
	const [session] = useSession();
	const messageRef = useRef<HTMLDivElement>(null);
	const avatar = user.avatar ? process.env.API_URL + user.avatar : fallbackAvatar;

	/**
	 * Extract mention in message, wrap it in a span with mention class
	 */
	const extractMention = (message: string): string => {
		return (message.replace(/@(\w+)/g, `<span class="${styles.mention}">@$1</span>`)); 
	}

	/**
	 * Split a message if username + message is more than X characters
	 * In progress
	 */
	const splitLongMessages = (message: string): string[] => {
		if (user.login.length + message.length <= 30) {
			return [extractMention(message)];
		}

		const availableSpace = 30 - user.login.length;
		const spaceIndex = message.lastIndexOf(' ', availableSpace);
		if (spaceIndex === -1) {
			return ([
				extractMention(message.substring(0, availableSpace - 10)), 
				extractMention(message.substring(availableSpace - 10))
			])
		}
		const firstPart = extractMention(message.substring(0, spaceIndex));
		const secondPart = extractMention(message.substring(spaceIndex + 1));

		return [firstPart, secondPart];
	}

	const handleProfileClick = () => {
		onProfileClick(messageRef, user);
	}

	const messages = splitLongMessages(message);
	const containMention = message.includes(`@${session?.login}`);

	return (
		<li
			className={styles.rowContainer}
			data-is-long={messages.length > 1}
			data-user-role={user?.role || ""}
			data-is-mention={containMention}
			data-is-channel-member={user?.isInChannel && !user?.isBan}
		>
			<div className={styles.row}>
				<div 
					onClick={handleProfileClick}
					onKeyDown={handleProfileClick}
					role="button"
					tabIndex={0}
					ref={messageRef}
					style={{height:24, width:24}}
				>
					<img className={styles.profilPic} src={avatar} alt={`avatar of ${user.login}`}/>
				</div>
				<UserBadge
					type="filled"
					level={user.experience.level}
					userRole={user?.role}
				/>
				<span className={styles.login}>{user.login}:</span>
				<span className={styles.message} dangerouslySetInnerHTML={{__html: messages[0]}}/>
			</div>
			{messages.length > 1 ? (
				<div className={styles.messageLong} dangerouslySetInnerHTML={{__html: messages[1]}}/>
			) : null}
		</li>
	);
};

interface TchatRowProps {
	user: Participant;
	message: string;
	onProfileClick: (messageRef:React.RefObject<HTMLDivElement>, user: Participant) => void;
}

export default TchatRow;