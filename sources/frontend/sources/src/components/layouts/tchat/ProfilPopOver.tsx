import React, {useState} from 'react';
import { Link } from 'wouter';

import DetailPopOver from '../../common/dialog/DetailPopOver';
import PickGameDialog from '../../modules/Challenge/PickGameDialog';

enum userChannelEditPage {
	general,
	admin
}

const ProfilPopOver = (props: ProfilPopOverProps) => {
	const { messageRef, onClose, selectedUser, isAdmin, isOwner, isMe } = props;
	const [page, setPage] = useState<number>(userChannelEditPage.general);
	const [isSelectingChallenge, setIsSelectingChallenge] = useState<boolean>(false);

	const displayAdminMenu = (isAdmin || isOwner) && !isMe && selectedUser?.isInChannel;

	const handleClose = (key?:PopOverActions) => {
		setPage(userChannelEditPage.general);
		onClose(key);
	}

	const genMenuRow = (key:PopOverActions|undefined, label:string, onClick?:() => void) => {
		const close = key ? () => handleClose(key) : onClick;
		return (
			<div
				onClick={close}
				role='button'
				tabIndex={0}
				onKeyDown={close}
				key={key}
			>
				<li>
					{label}
				</li>
			</div>
		)
	}

	const genGeneralMenu = () => (
		<>
			<li>
				<Link href={`/profile/${selectedUser?.ID}`}><a>Profile</a></Link>
			</li>
			{!isMe ? genMenuRow(undefined, 'Challenge', () => setIsSelectingChallenge(true)) : undefined}
			{!isMe ? genMenuRow("message", 'Message') : undefined}
			{displayAdminMenu ? 
				genMenuRow(undefined, 'Admin', () => setPage(userChannelEditPage.admin))
				: undefined}
		</>
	)

	const genAdminMenu = () => {
		const currentDate = new Date();
		const isUserMute = selectedUser?.muteEnd ? new Date(selectedUser.muteEnd) > currentDate: false;
		return (
			<>
				{genMenuRow("edit", 'Edit')}
				{genMenuRow("ban", selectedUser?.isBan ? 'Unban' : 'Ban')}
				{genMenuRow("mute", isUserMute ? 'Unmute' : 'Mute')}
				{genMenuRow("kick", 'Kick')}
				{genMenuRow(undefined, 'Return', () => setPage(userChannelEditPage.general))}
			</>
		)
	}

	const genMenu = () => {
		switch (page) {
		case userChannelEditPage.general:
			return genGeneralMenu();
		case userChannelEditPage.admin:
			return genAdminMenu();
		}
	}

	return (
		<>
			<DetailPopOver
				givenRef={messageRef}
				onClose={handleClose}
			>
				{genMenu()}
			</DetailPopOver>
			<PickGameDialog
				open={isSelectingChallenge}
				onClose={() => setIsSelectingChallenge(false)}
				challengedUserId={selectedUser?.ID || null}
			/>
		</>
	);
};

interface ProfilPopOverProps {
	messageRef: React.RefObject<HTMLDivElement> | null;
	onClose: (action?:PopOverActions) => void;
	selectedUser: Participant | undefined;
	isAdmin?: boolean;
	isOwner?: boolean;
	isMe?: boolean;
}

export default ProfilPopOver;