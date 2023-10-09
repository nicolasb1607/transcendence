import React from 'react';

import DetailPopOver from '../../common/dialog/DetailPopOver';

const RoomCardPopOver = (props: RoomCardPopOverProps) => {
	const { cardRef, onClose, onMenuClick, isOwner, selectedRoom } = props;

	const genMenuRow = (key:string, label:string) => (
		<div
			onClick={() => onMenuClick(key)}
			role='button'
			tabIndex={0}
			onKeyDown={() => onMenuClick(key)}
		>
			<li>
				{label}
			</li>
		</div>
	)

	const genMenu = () => (
		<>
			{isOwner === true ? genMenuRow('manage', 'Manage') : undefined}
			{selectedRoom?.isMember ? 
				(!isOwner ? genMenuRow('leave', 'Leave') : undefined)
				:  genMenuRow('join', 'Join')}
			{selectedRoom?.isMember ? genMenuRow('joinMemberRoom','Open in sidebar') : undefined}
		</>
	)
	return (
		<DetailPopOver
			givenRef={cardRef}
			onClose={onClose}
		>
			{genMenu()}
		</DetailPopOver>
	);
};

interface RoomCardPopOverProps {
	cardRef: React.RefObject<HTMLDivElement|HTMLButtonElement> | null;
	onClose: () => void;
	onMenuClick: (key:string) => void;
	selectedRoom: ChatDetails | null;
	isOwner?: boolean;
}

export default RoomCardPopOver;