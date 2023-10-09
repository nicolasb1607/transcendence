import React, { useState, useEffect} from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SettingsIcon from '@mui/icons-material/Settings';
import Achievement from '../../components/modules/Achievements/Achievement';
import ProfileCard from '../../components/modules/ProfileCard/ProfileCard';
import Friends from '../../components/modules/Friends/Friends';
import HistoryTable from '../../components/modules/HistoryTab/HistoryTab';
import EditProfile from '../../components/modules/EditProfile/EditProfile';
import { useRoute } from 'wouter';
import { withAuth } from '../../components/modules/auth/withAuth';
import { useSession } from '../../hooks/useSession';
import UserStats from '../../components/modules/Stats/UserStats';
import { fetchUserStats, getUserById } from '../../services/user';
import { navigate } from 'wouter/use-location';

import styles from './UserPage.module.css'
import tabstyle from './UserPageTab.style';

type selectedTab =  "stats" | "achievements" | "friends" | "gameHistory" | "edit"

const UserPage = () => {
	const [session, isLoading] = useSession();
	const [hasLoaded, setHasLoaded] = useState<boolean>(false);
	const [clickedTab, setClickedTab] = useState<selectedTab>("stats");
	const [currentUserData, setCurrentUserData] = useState<UserDetails>(session as UserDetails);
	const [match, params] = useRoute("/profile/:userId");
	const [userStats, setUserStats] = useState<enhanceUserStat|null>(null);

	useEffect(() => {
		if (!isLoading && session?.ID && !hasLoaded) {
			setHasLoaded(true);
		}
	}, [session, isLoading, hasLoaded])

	
	useEffect(() => {
		if (params?.userId || !session?.ID) return ;
		navigate(`/profile/${session.ID}`);
	}, [params, session?.ID])

	const currentPageUserId:number = parseInt(params?.userId || "0");
	let isOwner = false; 
	if (match && session?.ID) {
		isOwner = (currentPageUserId == session.ID) ? true : false;
	}

	useEffect(() => {
		const loadUserStats = async () => {
			setUserStats(await fetchUserStats(currentPageUserId));
		}
		loadUserStats();
	}, []);
	const totalGame = (userStats?.loose || 0) + (userStats?.win || 0);

	/**
	 * Redirect user to his own profile if he tries to access `/profile` without
	 * specifying a user ID
	 */
	useEffect(() => {
		if (params?.userId || !session?.ID) return ;
		navigate(`/profile/${session.ID}`);
	}, [params, session?.ID])
	
	useEffect(() => {
		const loadUserDetails = async () => {
			const userData = await getUserById(currentPageUserId);
			if ((isOwner && !session) || (!isOwner && !userData)) return ;
			setCurrentUserData(isOwner ? session as UserDetails : userData as UserDetails);
		}
		loadUserDetails();
	}, [currentPageUserId, isOwner])
	

	const handleChange = (event: React.SyntheticEvent, newValue: selectedTab) => {
		event as React.MouseEvent<HTMLDivElement>;
		setClickedTab(newValue);
 	};
	
	const genMenuArea = ():JSX.Element => {
		return (
			<div className={styles.menu}>
				<Tabs sx={tabstyle}
					value={clickedTab}
					onChange={handleChange}
				>
					<Tab value="stats" label="Stats" />
					<Tab value="achievements" label="Achievements" />
					<Tab value="friends" label="Friends" />
					<Tab value="gameHistory" label="Game history" />
					{isOwner ? (
						<Tab id={"settings"}
							icon={<SettingsIcon fontSize='small' />}
							iconPosition="start" 
							value="edit" label="Edit my profile" 
						/>
					) : undefined}
				</Tabs>
			</div>
		)
	}

	const genContent = (clickedTab:selectedTab) => {
		if (!hasLoaded) return;
		const tabsToComponent = {
			stats: <UserStats userId={currentPageUserId}/>,
			achievements : <Achievement userId={currentPageUserId}/>,
			friends: <Friends currentPageId={currentPageUserId}/>,
			edit: <EditProfile/>,
			gameHistory: <HistoryTable userId={currentPageUserId}/>,
		}
		return (tabsToComponent[clickedTab]);
	}

	if (isLoading || !hasLoaded || !currentUserData) return (<></>);
	return (
		<div id={styles.contentContainer}>
			<div className={styles.mainContent}>
				<ProfileCard
					user={currentUserData as UserDetails}
					totalGame={totalGame || 0}
					win={userStats?.win || 0}
					defeat={userStats?.loose || 0}
					edit={clickedTab == "edit"}
				/>
				<div className={styles.tab} data-tabindex={clickedTab}>
					{genMenuArea()}
					{genContent(clickedTab)}
				</div>
			</div>
		</div>
	);
};

const UserPageWithAuth = withAuth(UserPage);

export default UserPageWithAuth;