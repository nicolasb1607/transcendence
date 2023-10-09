import React from 'react';
import Popover from '@mui/material/Popover';

import styles from './DetailPopOver.module.css';

const DetailPopOver = (props: RoomCardPopOverProps) => {
	const { givenRef, onClose, children } = props;

	return (
		<Popover
			open={Boolean(givenRef)}
			anchorEl={givenRef && givenRef.current}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'center',
				horizontal: 'left',
			}}
			transformOrigin={{
				vertical: 'center',
				horizontal: 'right',
			}}
			sx={{
				'& .MuiPopover-paper': {
					overflowX: 'initial',
					overflowY: 'visible',
					borderRadius: '8px',
					transform: 'translateX(-16px)!important'
				}
			}}
		>
			<ul id={styles.profilPopOver}>
				{children}
			</ul>
		</Popover>
	);
};

interface RoomCardPopOverProps {
	givenRef: React.RefObject<HTMLDivElement|HTMLButtonElement> | null;
	onClose: () => void;
	children: React.ReactNode;
}

export default DetailPopOver;