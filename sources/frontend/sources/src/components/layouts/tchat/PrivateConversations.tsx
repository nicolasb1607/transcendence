import React, { useContext, useEffect, useState } from 'react';
import { fetchUserPrivateChannel } from '../../../services/chat';
import PrivateConvRow from './PrivateConvRow';
import { Search } from '@mui/icons-material';
import BootstrapIconInput from '../../common/inputs/BootsrapIconInput';
import { InputAdornment } from '@mui/material';
import { searchUsers } from '../../../services/user';

import styles from './Tchat.module.css';
import { Session } from '../../modules/auth/session/session';

const PrivateConversations = (props: PrivateConversationsProps) => {
	const { userId, onConversationSelected } = props;
	const sessionHandler = useContext(Session);
	const [privateChannels, setPrivateChannels] = useState<Chat[] | null>([]);
	const [search, setSearch] = useState<string>("");
	const [users, setUsers] = useState<UserDetails[] | null>([]);
	const blockedUsers = sessionHandler?.authUser?.session?.relations?.blocked || [];
	const filteredPrivateChannels = privateChannels?.filter((channel) => {
		const targetUser = channel.participants.find((user) => user.ID !== userId);
		return targetUser?.login.toLocaleLowerCase().includes(search.toLowerCase());
	}).filter((channel) => {
		const targetUser = channel.participants.find((user) => user.ID !== userId);
		return (!blockedUsers.includes(targetUser?.ID || 0) && channel.participants.length === 2);
	});

	useEffect(() => {
		const loadUserPrivateChannel = async () => {
			setPrivateChannels(await fetchUserPrivateChannel(userId));
		}
		loadUserPrivateChannel();
	}, []);

	useEffect(() => {
		const loadUsers = async () => {
			setUsers(await searchUsers(search));
		}
		loadUsers();
	}, [search]);

	const genSearchInput = () => (
		<div id={styles.searchUser}>
			<BootstrapIconInput
				id="searchUser"
				placeholder="Rechercher un utilisateur"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				endAdornment={
					<InputAdornment position="end">
						<Search />
					</InputAdornment>
				}
				sx={{
					paddingRight: "12px",
					borderRadius: "4px",
					width: 340
				}}
			/>
		</div>
	)

	const genSearchedUsers = () => {
		if (search.length === 0) return;
		if (!users) return;
		return (
			<div id={styles.searchedUsers}>
				<div className={styles.cat}>
					<span>Search</span>
				</div>
				{users?.map((user) => {
					if (!user?.ID || user.ID === userId) return;
					return (
						<PrivateConvRow
							key={user.ID}
							//@ts-expect-error UserDetail is fitting in Participant
							channel={{ ID: 0, participants: [user], messages: [] }}
							userId={userId}
							onClick={onConversationSelected}
							isNew={true}
						/>
					)
				})}
			</div>
		)
	}

	return (
		<div id={styles.privateConversations}>
			{genSearchInput()}
			{filteredPrivateChannels?.map((channel) => (
				<PrivateConvRow
					key={channel.ID}
					channel={channel}
					userId={userId}
					onClick={onConversationSelected}
				/>
			))}
			{genSearchedUsers()}
		</div>
	);
};

interface PrivateConversationsProps {
	userId: number;
	onConversationSelected: (event: userPrivateClickEvent) => void;
}

export default PrivateConversations;