import React, {useState, useEffect} from 'react';
import Chip from '@mui/material/Chip';
import { Avatar } from '@mui/material';
import { Search } from '@mui/icons-material';
import AutocompleteBootstrapInput from '../../../common/inputs/AutocompleteBootstrapInput';
import { searchUsers } from '../../../../services/user';

import styles from './ManageRoomsDialog.module.css';
import { useSession } from '../../../../hooks/useSession';

const InvitePeoples = (props: InvitePeoplesProps) => {
	const [session] = useSession();
	const [users, setUsers] = useState<UserDetails[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<Array<UserDetails|RoomMember>>([]);
	const { currentRoom, updateCurrentRoom } = props;

	useEffect(() => {
		const fetchUsers = async () => {
			const users = await searchUsers("");
			setUsers(users.filter(user => user.ID !== session?.ID));
		}
		fetchUsers();
	}, []);

	useEffect(() => {
		if (!currentRoom) return;
		if (currentRoom?.previousParticipants && selectedUsers.length === 0) {
			setSelectedUsers(currentRoom.previousParticipants);
			updateCurrentRoom({
				participants: currentRoom.previousParticipants.map(user => user.ID),
				previousParticipants: undefined
			})
		}
	}, [currentRoom]);

	const genAvatar = (user:UserDetails) => (
		<Avatar
			src={process.env.API_URL as string + user.avatar}
			alt={`${user?.login} avatar`}
		/>
	)

	const handleUserRemove = (user:UserDetails, index:number) => {
		if (user.ID === currentRoom?.ownerId) return;
		const newSelectedUsers = [...selectedUsers];
		newSelectedUsers.splice(index, 1);
		setSelectedUsers(newSelectedUsers);
		updateCurrentRoom({
			participants: newSelectedUsers.map(user => user.ID)
		})
	}

	const genSelectedUsers = () => {
		return (
			<div id={styles.selectedUsers}>
				{selectedUsers.map((user:RoomMember|UserDetails, index:number) => {
					const onDeleteProps = currentRoom?.ownerId !== user.ID ? {onDelete: () =>  handleUserRemove(user, index)} : {};
					console.log({user})
					return (
						<Chip
							key={index}
							label={user?.login}
							avatar={genAvatar(user)}
							data-is-member={"isConfirmed" in user ? user.isConfirmed : false}
							{...onDeleteProps}
						/>
					)
				})}
			</div>
		)
	}

	const genOption = (props: React.HTMLAttributes<HTMLLIElement>, option: UserDetails) => (
		<li {...props} className={styles.option}>
			{genAvatar(option)}
			{option?.login}
		</li>
	)

	const handlePickUser = (user:UserDetails | null) => {
		if (!user || !user?.ID) return;
		if (selectedUsers.find(selectedUser => selectedUser.ID === user.ID)) {
			return;
		}
		setSelectedUsers([...selectedUsers, user]);
		updateCurrentRoom({participants: [...currentRoom.participants, user.ID]});
	}

	const handleSearchInputChange = async (value:string|null) => {
		if (!value) return;
		const users = await searchUsers(value);
		if (!Array.isArray(users)) return;
		setUsers(users.filter(user => user.ID !== session?.ID))
	}

	return (
		<div id={styles.invitePeoples}>
			<AutocompleteBootstrapInput<UserDetails>
				label="Search peoples"
				formSx={{
					width: "100%"
				}}
				clearInputOnSelect={true}
				onChange={(_:React.SyntheticEvent,
					newValue: UserDetails|UserDetails[]|null) => handlePickUser(newValue as UserDetails | null)}
				onInputChangeDebounce={handleSearchInputChange}
				autocompleteProps={{
					getOptionLabel: (option:string|UserDetails) => (
						typeof option !== "string" ? option?.login : option
					),
					sx: {
						width: "100%",
						'& .MuiOutlinedInput-root': {
							width: "100%"
						}
					},
					options: users,
					renderOption: genOption,
					popupIcon: <Search />,
					filterSelectedOptions: true
				}}
			/>
			{genSelectedUsers()}
		</div>
	);
};

type InvitePeoplesProps = BaseManageRoom;

export default InvitePeoples;