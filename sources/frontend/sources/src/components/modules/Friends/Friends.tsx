import React, { useEffect, useRef, useState } from 'react';
import { Search } from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import FriendCard from './FriendCard';
import { useSession } from '../../../hooks/useSession';
import { getUsersByIds, retrieveUserRelation, searchUsers } from '../../../services/user'
import { BootstrapSelect } from '../../common/inputs/BootstrapSelect';
import { updateRelationInDb } from '../../../services/relation';
import type { SelectChangeEvent } from '@mui/material/Select';

import style from './Friends.module.css';
import { Helmet } from 'react-helmet';

const Friends = (props: FriendsProps):JSX.Element => {
	const {currentPageId} = props;

	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [Session, _, __, updateUserRelation] = useSession();

	const [userRelationIds, setUserRelationIDs] = useState<userRelations|undefined>();
	const [selectedFriendsShip, setSelectedFriendship] = useState<friendshipStatus>("friend");
	const [search, setSearch] = useState<string>("");
	const [searchedUsers, setSearchedUsers] = useState<UserDetails[]>([]);
	const [usersRelationList, setUsersRelationList] = useState<Friend[]>([]);
	const searchRef = useRef<HTMLInputElement>(null);

	
	const isMyUserPage = currentPageId === Session?.ID;
	const currentRelations:userRelations|undefined = isMyUserPage ? Session?.relations : userRelationIds;
	
	const friendsList:Friend[] = usersRelationList
		.filter((friend) => friend.friendship === selectedFriendsShip)
		.filter((friend) => friend.login.toLowerCase().includes(search.toLowerCase()));


	useEffect(() => {
		const loadUserRelationByType = async (relationIds?:userRelations) => {
			const selectedRelations = isMyUserPage ? Session?.relations : relationIds;
			if (!selectedRelations) return;
			const users = await getUsersByIds(selectedRelations[selectedFriendsShip]);
			if (!users || users.length < 1) {
				setUsersRelationList([]);
				return;
			}
			setUsersRelationList(users.map((user:UserDetails) => {
				return ({
					...user,
					friendship: selectedFriendsShip
				})
			}))
		}
		const loadUserRelationIds = async () => {
			const relationIds = await retrieveUserRelation(currentPageId);
			if (!relationIds) return;
			setUserRelationIDs(relationIds);
			loadUserRelationByType(relationIds);
		}
		
		if (!isMyUserPage) loadUserRelationIds();
		else loadUserRelationByType();
	}, [selectedFriendsShip, currentPageId, Session]);
	
	useEffect(() => {
		const loadUsers = async () => {
			const users = await searchUsers(search);
			setSearchedUsers(users);
		}
		if (search.length < 1) return;
		const timeout = setTimeout(() => {
			loadUsers();
		}, 250);
		return () => clearTimeout(timeout);
	}, [search]);
	
	
	const handleChange = (event: SelectChangeEvent<unknown>) => {
		setSelectedFriendship(event.target.value as friendshipStatus);
		if (searchRef.current){
			searchRef.current.value = "";
		}
		setSearch("");
	};

	const handleUserRelationUpdate = async (newStatus:friendshipStatus, userId:number, targetId:number) => {
		const response = await updateRelationInDb(newStatus, userId, targetId); 
		if (!response || "statusCode" in response) return;
		const updatedUsersList = usersRelationList.map((user) => {
			if (user.ID === targetId) {
				user.friendship = newStatus;
			}
			return (user);
		})
		updateUserRelation(newStatus, targetId);
		setUsersRelationList(updatedUsersList); 
	}

	const handleSearchInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	}

	const genSearchBar = ():JSX.Element => {
		return (
			<>
				<Search className={style.searchIcon} />
				<input
					id={style.searchField}
					type="text"
					placeholder='Search'
					onChange={handleSearchInputChange}
					ref={searchRef}
				/>
			</>
		)
	}

	const genSelector = ():JSX.Element => {
		return (
			<BootstrapSelect variant='standard'
				id={style.friendsSelector}
				value={selectedFriendsShip}
				onChange={handleChange}
				background='paper'
			>
				<MenuItem value={"friend"}>Friends</MenuItem>
				<MenuItem value={"requesting"}>Resquesting</MenuItem>
				<MenuItem value={"requested"}>Requested</MenuItem>
				<MenuItem value={"blocked"}>Blocked</MenuItem>
			</BootstrapSelect>
		)
	}

	const genCards = () => {
		if (friendsList.length === 0 && searchUsers.length === 0) {
			return (
				<div className={style.noFriends}>
					<p>You have no {selectedFriendsShip} players to show</p>
				</div>
			)
		}
		return (
			<>
				{friendsList.map(friend => (
					<FriendCard
						key={friend.ID}
						currentPageId={props.currentPageId}
						cardRelation={friend}
						onUserRelationUpdate={handleUserRelationUpdate}
					/>
				))}
			</>
		)
	}

	const genSearchedUsers = () => {
		/**
		 * Get the relation between the current user and the user with the given id
		 * from `currentRelations`
		 */
		const getRelationById = (id:number):friendshipStatus => {
			if (!currentRelations) return ("none");
			for (const [key, value] of Object.entries(currentRelations)) {
				if (value.indexOf(id) !== -1) {
					return (key as friendshipStatus);
				}
			}
			return ("none");
		}

		if (!searchedUsers || searchedUsers.length === 0
			|| search.length < 1) return;
		
		return (searchedUsers?.map((user) => {
			if (friendsList.find((friend) => friend.ID === user.ID)) return;
			user.friendship = getRelationById(user.ID);
			//set friendship status from usersRelationList or from session
			return (
				<FriendCard
					key={user.ID + 'searched'}
					currentPageId={props.currentPageId}
					cardRelation={user}
					onUserRelationUpdate={handleUserRelationUpdate}
				/>
			)
		}))
	}

	return (
		<div className={style.container}>
			<Helmet title='Profile | Friends' />
			<div className={style.sectionHeader}>
				<h2 className={style.title}>Friends List</h2>
				<p>Here you can find your friends and even make new ones</p>
			</div>
			<div className={style.sectionSearchBar} >
				<div className={style.searchBar} >
					{genSearchBar()}
				</div>
				{isMyUserPage ? genSelector() : undefined}
			</div>
			<div className={style.cardComponentSection}>
				{genCards()}
				{genSearchedUsers()}
			</div>
		</div> 
	);
};

interface FriendsProps {
	currentPageId: number;
}

export default Friends;