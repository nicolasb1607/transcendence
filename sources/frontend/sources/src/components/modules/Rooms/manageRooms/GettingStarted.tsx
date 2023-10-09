import React from 'react';
import LabeledBootstrapInput from '../../../common/inputs/LabeledBootstrapInput';
import LabeledBootstrapSelect from '../../../common/inputs/LabeledBootstrapSelect';
import PasswordInput from '../../../common/inputs/PasswordInput';
import { MenuItem } from '@mui/material';

import styles from './ManageRoomsDialog.module.css';

const GettingStarted = (props: GettingStartedProps) => {
	const { currentRoom, updateCurrentRoom } = props;

	const genPasswords = () => {
		if (currentRoom.type !== 'protected') return ;
		return (
			<>
				<PasswordInput label='Room Password' inputProps={{
					type: 'password',
					name: 'password',
					required: true,
					onChange: (e) => updateCurrentRoom({password: e.target.value}),
					value: currentRoom.password
				}}
				/>
				<PasswordInput label='Room Password Confirmation' inputProps={{
					type: 'password',
					name: 'passwordConfirmation',
					required: true,
					fullWidth: true,
					onChange: (e) => updateCurrentRoom({passwordConfirmation: e.target.value}),
					value: currentRoom.passwordConfirmation
				}}
				/>
			</>
		)
	}

	return (
		<div id={styles.gettingStarted}>
			<div className={styles.row}>
				<LabeledBootstrapInput label='Room Name' inputProps={{
					type: 'text',
					name: 'name',
					required: true,
					onChange: (e) => updateCurrentRoom({name: e.target.value}),
					value: currentRoom.name
				}}
				/>
				<LabeledBootstrapSelect label='Room Type' selectProps={{
					name: 'type',
					required: true,
					defaultValue: 'public',
					onChange: (e) => updateCurrentRoom({type: e.target.value as RoomType}),
					value: currentRoom.type
				}}
				>
					<MenuItem value='public'>Public</MenuItem>
					<MenuItem value='protected'>Protected</MenuItem>
					<MenuItem value='private'>Private</MenuItem>
				</LabeledBootstrapSelect>
			</div>
			{genPasswords()}
		</div>
	);
};

type GettingStartedProps = BaseManageRoom;

export default GettingStarted;