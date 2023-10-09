import React, { useRef } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import styles from "../../../pages/ChatRooms/ChatRooms.module.css";

const roomAvatarPath = process.env.API_URL + "avatars/public/groupAvatars/";

const RoomCard = (props: RoomCardProps) => {
	const { name, image, memberCount, type } = props.room;
	const cardRef = useRef<HTMLButtonElement>(null);
	
	const handleMoreClick = () => props.onMoreClick(cardRef, props.room);

	return (
		<div className={styles.roomCard}>
			<div className={styles.cardContent}>
				<img 
					src={roomAvatarPath + image} 
					alt={`${name} chat room`}
					width={80}
					height={80}
				/>
				<span>{name}</span>
			</div>
			<div className={styles.cardBottom}>
				<span>{memberCount} members</span>
				<span>|</span>
				<span>{type}</span>
			</div>
			<button className={styles.cardMore} onClick={handleMoreClick} ref={cardRef}>
				<MoreVertIcon />
			</button>
		</div>
	);
};

interface RoomCardProps {
	room: ChatDetails;
	onMoreClick: (
		ref: React.RefObject<HTMLButtonElement>,
		room: ChatDetails
	) => void;
}

export default RoomCard;