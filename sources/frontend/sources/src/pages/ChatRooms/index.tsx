import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import BootstrapIconInput from '../../components/common/inputs/BootsrapIconInput';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import RoomCard from '../../components/modules/Rooms/RoomCard';
import { getChannels, getUserChannels, leaveChannel, joinChannel, getChannelBans } from '../../services/chat';
import { useSession } from '../../hooks/useSession';
import { withAuth } from '../../components/modules/auth/withAuth';
import ManageRoomsDialog from '../../components/modules/Rooms/manageRooms/ManageRoomDialog';
import RoomCardPopOver from '../../components/modules/Rooms/RoomCardPopOver';
import { ChannelContext } from '../../components/layouts/tchat/currentChannel.context';
import ProtectedChannelDialog from '../../components/layouts/tchat/ProtectedChannelDialog';
import { Helmet } from 'react-helmet';
import { enqueueSnackbar } from 'notistack';

import styles from './ChatRooms.module.css';

interface selectedCard {
	ref: React.RefObject<HTMLButtonElement> | null;
	room: ChatDetails | null;
}

interface handleManageRooms {
	open: boolean;
	editId: number | null;
}

interface ChatError {
	message: string;
	channelId: number;
}

const ChatRooms = () => {
	//move state outside of component ?
	const [session, isLoading] = useSession();
	const [rooms, setRooms] = useState<ChatDetails[]|null>([]);
	const [userRooms, setUserRooms] = useState<ChatDetails[]|null>([]);
	const [search, setSearch] = useState<string>("");
	const [hasLoaded, setHasLoaded] = useState<boolean>(false);
	const [error, setError] = useState<ChatError|null>(null);
	const [banChannels, setBanChannels] = useState<number[]|null>(null);
	const [openManageRooms, setOpenManageRooms] = useState<handleManageRooms>({open:false, editId:null});
	const [selectedCard, setSelectedCard] = useState<selectedCard>({ref:null, room:null});
	const channelHandler = useContext(ChannelContext);

	useEffect(() => {
		if (!isLoading && session?.ID && !hasLoaded) {
			const loadUserChannels = async () => {
				setUserRooms(await getUserChannels(session.ID))
			}
			const loadRooms = async () => {
				setRooms(await getChannels());
			}

			setHasLoaded(true);
			loadUserChannels();
			loadRooms();
		}
	}, [session, isLoading, hasLoaded])

	const genPageInfo = () => (
		<Helmet title='Chat Rooms' />
	)
      
	useEffect(() => {
		const loadBanChannels = async () => {
			setBanChannels(await getChannelBans());
		}
		loadBanChannels();
	}, []);

	const handleOpenRooms = (editId:number|null = null) => setOpenManageRooms({open:true, editId});

	const genHead = () => {
		return (
			<div className={styles.head}>
				<div className={styles.headTitle}>
					<h1>Chat Rooms</h1>
					<p>Set up your preferred chat rooms and start talking with your friends and opponents.</p>
					{genSearchInput()}
				</div>
				<div>
					<Button
						variant="outlined"
						color="primary"
						onClick={() => handleOpenRooms(null)}
					>Create room</Button>
				</div>
			</div>
		)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => 
		setSearch(e.target.value);

	const genSearchInput = () => (
		<BootstrapIconInput
			placeholder="Search for a room..."
			sx={{
				backgroundColor: 'var(--background-light)!important',
				paddingRight: "12px",
				borderRadius: "4px",
				width: 340
			}}
			className={styles.searchInput}
			onChange={handleInputChange}
			value={search}
			startAdornment={
				<InputAdornment position="end">
					<SearchIcon />
				</InputAdornment>
			}
		/>
	)

	const handleRoomMoreClick = (ref: React.RefObject<HTMLButtonElement>, room:ChatDetails) => 
		setSelectedCard({ref, room});

	const genRooms = (title:string, roomsList: ChatDetails[]|null) => {
		const hasRooms = (roomsList && roomsList.length > 0);
		return (
			<div className={styles.rooms}>
				<h2>{title}</h2>
				<div>
					{hasRooms ? roomsList.map((cRoom) => {
						if (banChannels?.includes(cRoom.ID)) return ;
						return (
							<RoomCard 
								key={cRoom.ID}
								room={cRoom}
								onMoreClick={handleRoomMoreClick}
							/>
						)
					}) : null}
				</div>
			</div>
		)
	}

	const handleCloseManageRooms = (reload?:boolean) => {
		if (reload){
			setHasLoaded(false);
		}
		setOpenManageRooms({open:false, editId:null});
	}

	const handleMenuClick = async (key:string) => {
		if (!selectedCard.room) return;
		let res:boolean|NestError = false;
		switch (key) {
		case 'join':
			const response = await joinChannel(selectedCard.room.ID);
			if (response === true){
				setHasLoaded(false);
				channelHandler.setChannelId(selectedCard.room.ID);
			} else if (response && response.error === "PasswordRequired"){
				setError({
					message: response.error,
					channelId: selectedCard.room.ID
				});
			}
			break;
		case 'joinMemberRoom':
			channelHandler.setChannelId(selectedCard.room.ID);
			break;
		case 'leave':
			res = await leaveChannel(selectedCard.room?.ID);
			if (res && res !== true && "error" in res) {
				enqueueSnackbar(res.message, { variant: 'error' });
			} else if (res && channelHandler.channelId === selectedCard.room?.ID){
				setHasLoaded(false);
				channelHandler.setChannelId(0);
			}
			break;
		case 'manage':
			handleOpenRooms(selectedCard.room?.ID);
			break;
		}
		if (res) {
			setHasLoaded(false);
		}
		setSelectedCard({ref:null, room:null});
	}

	const filterRooms = (rooms: ChatDetails[]|null) => {
		if (!rooms) return null;
		return rooms.filter((room) => room.name.toLowerCase().includes(search.toLowerCase()));
	}

	const handleCloseProtectedChannelDialog = (success?:boolean, channelId?:number) => {
		if (success && channelId){
			setHasLoaded(false);
			channelHandler.setChannelId(channelId);
		}
		setError(null);
	}

	const userRoomsIds = Array.isArray(userRooms) ? userRooms.map((room) => room.ID) : [];
	const managedRoom = userRooms?.find((room) => room.ID === selectedCard.room?.ID);
	const isOwner = managedRoom?.ownerId === session?.ID;

	return (
		<div id={styles.chatRooms}>
			{genPageInfo()}
			{genHead()}
			{genRooms("My rooms", filterRooms(userRooms))}
			{genRooms("Add new rooms", filterRooms(rooms?.filter((room) => !userRoomsIds.includes(room.ID)) || null))}
			<ManageRoomsDialog
				open={openManageRooms.open}
				onClose={handleCloseManageRooms}
				edit={Boolean(openManageRooms.editId)}
				roomId={openManageRooms.editId}
			/>
			<RoomCardPopOver
				cardRef={selectedCard.ref}
				selectedRoom={selectedCard.room}
				onClose={() => setSelectedCard({ref:null, room:null})}
				onMenuClick={handleMenuClick}
				isOwner={isOwner}
			/>
			<ProtectedChannelDialog
				open={error?.message === "PasswordRequired"}
				onClose={handleCloseProtectedChannelDialog}
				channelId={error?.channelId || -1}
			/>
		</div>
	);
};
const ChatRomsWithAuth = withAuth(ChatRooms);

export default ChatRomsWithAuth;