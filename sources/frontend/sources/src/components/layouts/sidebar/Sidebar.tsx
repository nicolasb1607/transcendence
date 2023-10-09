import React, { useState } from 'react';
import { Link } from "wouter";
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LinearProgress from '@mui/material/LinearProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import { Button, Tooltip } from '@mui/material';
import { navigate } from "wouter/use-location";
import { useSession } from '../../../hooks/useSession';
import UserBadge from '../../common/UserBadge/UserBadge';
import GameButton from "../../common/GameButton/GameButton";

import LevelExperience from "../../../data/levelExperience.json";
import levelProgression from "../../../data/levelProgression.json";
import styles from './Sidebar.module.css';

const Sidebar = () => {
	const [session, isLoading] = useSession();
	const [isOpen, setIsOpen] = useState<boolean>(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState(true);
	const isUserLogged = session !== undefined && !isLoading;
	
	const genLogoArea = (): JSX.Element => {
		return (
			<Link href="/">
				<div id={styles.logoArea}>
					<img src={"/pong_logo.jpg"}  alt="Logo du site" />
					<span id={styles.logoText}>Spatial Pong</span>
				</div>
			</Link>
		)
	}

	const genProfileArea = (): JSX.Element|undefined => {
		if (!isUserLogged) return ;
		const userAvatar = "avatar" in session && typeof session.avatar !== 'undefined' ? (
			process.env.API_URL + session.avatar.replace("/avatars","/avatars/small")
		) : process.env.API_URL + "/avatars/order_avatar3.jpg";//bug ?
		const experience:UserLevel = "experience" in session
			&& session.experience != undefined ? session.experience : {level: 0, exp: 0};
		const level = experience?.level || 0;
		const expForNextLevel = LevelExperience[level + 1];

		const genExpJauge = (current: number, max: number): JSX.Element => {
			const amount: number = current / max * 100;
			const levelColor = levelProgression[Math.floor((level / 10))].color;
			return (
				<div id={styles.expJauge}>
					<Tooltip title={`${current} / ${max}`}>
						<div id={styles.bg}>
							<LinearProgress sx={{
								backgroundColor: 'var(--background)',
								borderRadius: '4px',
								width: '150px',
								height: '8px',
								'& .MuiLinearProgress-bar': {
									backgroundColor: levelColor
								}
							}}
							variant="determinate"
							value={amount}
							/>
						</div>
					</Tooltip>
				</div>
			);
		}

		return (
			<div id={styles.boxProfileArea}>
				<Button id={styles.profilArea} onClick={() => navigate(`/profile/${session.ID}`)}>
					<Avatar id={styles.profileAvatar} src={userAvatar} />
					<div id={styles.profileXP}>
						<UserBadge
							level={experience?.level || 0}
							type="filled"
						/>
						{genExpJauge(experience?.exp || 0, expForNextLevel)}
					</div>
				</Button>
				<div>
					<span id={styles.profilePseudo}>{session.login}</span>
				</div>
			</div>
		)
	}

	const genLink = (href:string, icon:JSX.Element, text:string): JSX.Element => (
		<Link href={href}>
			<a style={{width:'100%'}}>
				<div className={styles.iconLink}>
					{icon}
					{text}
				</div>
			</a>
		</Link>
	)

	const genDashboard = (): JSX.Element => {
		return (
			<div id={styles.dashboard}>
				<h2>Dashboard</h2>
				{genLink("/", <HomeIcon />, "Homepage")}
				{genLink("/leaderboards", <LeaderboardIcon />, "Leaderboards")}
				{genLink("/chat-rooms", <GroupsIcon />, "Chat Rooms")}
			</div>
		)
	}

	const genGameList = (): JSX.Element => { 
		const toggleDropdown = (): void => {
			setIsDropdownOpen(!isDropdownOpen);
		};

		return (
			<div className={styles.dropdown}>
				<div>
					<button className={styles.dropdownHeader} onClick={toggleDropdown} onKeyDown={toggleDropdown}>
						<h2>Games</h2>
						<KeyboardArrowDownIcon className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.rotateIcon : ''}`} fontSize="small" />
					</button>
				</div>
				<Collapse
					className={`${styles.dropdownContent}`}
					in={isDropdownOpen}
				>
					<ul>
						<li>
							<GameButton imgSrc="/classic.svg" alt="logo classic pong" gameName="Classic Pong" href="/pong/classic"/>
						</li>
						<li>
							<GameButton imgSrc="/astronaut.svg" alt="logo spatial pong" gameName="Spatial Pong" href="/pong/spatialPong"/>
						</li>
					</ul>
				</Collapse>
			</div>
		);
	};

	const genAdditionalInformation = (): JSX.Element => {
		return (
			<div id={styles.AdditionalInformation}>
				<h2>Additional Information</h2>
				<div>
					<ul>
						<li><a href="https://twitter.com/">Twitter</a></li>
						<li><a href="https://discord.com/">Discord</a></li>
					</ul>
				</div>
			</div>
		)
	}

	return (
		<Drawer
			variant="persistent"
			anchor="left"
			open={isOpen}
			onClose={() => setIsOpen(false)}
			sx={{
				'& .MuiDrawer-paper': {
					borderRight: 'none',
				}
			}}
		>
			<div id={styles.Sidebar}>
				<div>
					{genLogoArea()}
				</div>
				<div id={styles.Menu}>
					<hr className={styles.firstDivider} />
					{genProfileArea()}
					<hr className={styles.divider} />
					{genDashboard()}
					<hr className={styles.divider} />
					{genGameList()}
					<hr className={styles.divider} />
					{genAdditionalInformation()}
				</div>
			</div>
		</Drawer>
	);
};

export default Sidebar;
