import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, type SelectChangeEvent } from '@mui/material';
import LabeledBootstrapSelect from '../../common/inputs/LabeledBootstrapSelect';
import { Block } from '@mui/icons-material';
import { changeUserRole, muteUser } from '../../../services/chat';
import { formatDateToFrench } from '../../common/utils/date';

import styles from './Tchat.module.css';
import { useSnackbar } from 'notistack';

const EditUser = (props: EditUserProps) => {
	const { user, isOpen, onClose, channelId } = props;
	const [role, setRole] = useState<UserChannelRole>(user.channelRole);
	const { enqueueSnackbar } = useSnackbar();

	const currentDate = new Date();
	const isUserMute = user?.muteEnd ? +new Date(user.muteEnd) > +currentDate : false;
	//@ts-expect-error muteEnd is always true if isUserMute is true
	const muteUntil:string = isUserMute ? 'until ' + formatDateToFrench(new Date(user.muteEnd)) : '';
	const [isMute, setIsMute] = useState<boolean>(isUserMute);

	const handleRoleChange = (event: SelectChangeEvent<unknown>) => {
		setRole(event.target.value as UserChannelRole);
	}

	const handleEditUserSave = async () => {
		if (role !== user.channelRole) {
			if (await changeUserRole(channelId, user.ID, role)){
				enqueueSnackbar('User role changed', { variant: 'success' });
			} else {
				enqueueSnackbar('Error while changing user role', { variant: 'error' });
			}
		}
		if (isMute !== isUserMute) {
			if (await muteUser(channelId, user.ID)){
				enqueueSnackbar(`Successfully ${isMute ? 'unmuted' : 'muted'} ${user.login}`, { variant: 'success' });
			} else {
				enqueueSnackbar(`Failed to ${isMute ? 'unmute' : 'mute'} ${user.login}`, { variant: 'error' });
			}
		}
		onClose();
	}

	const genRadioArea = () => (
		<FormControl id={styles.radioArea}>
			<FormLabel>Mute ({muteUntil})</FormLabel>
			<RadioGroup
				aria-labelledby='is mute'
				value={isMute}
				onChange={() => setIsMute(!isMute)}
				row
				color='primary'
			>
				<FormControlLabel value={false} control={<Radio color='primary' />} label="No" />
				<FormControlLabel value={true} control={<Radio />} label="Yes" />
			</RadioGroup>
		</FormControl>
	)

	return (
		<Dialog
			open={isOpen}
			onClose={() => onClose()}
			id={styles.editUser}
		>
			<DialogTitle>Edit {user.login}</DialogTitle>
			<DialogContent>
				<LabeledBootstrapSelect
					label="Channel Role"
					selectProps={{
						value: role,
						className: styles.select,
						onChange: handleRoleChange,
					}}
				>
					<MenuItem value="admin">Admin</MenuItem>
					<MenuItem value="user">User</MenuItem>
				</LabeledBootstrapSelect>
				{genRadioArea()}
			</DialogContent>
			<DialogActions id={styles.actions}>
				<div style={{display: 'flex', gap: 12}}>
					<Button onClick={() => onClose()} variant='outlined'>Cancel</Button>
					<Button onClick={handleEditUserSave} variant='contained'>Save</Button>
				</div>
				<Button color='error' variant='contained' title='ban'><Block/></Button>
			</DialogActions>
		</Dialog>
	);
};

interface EditUserProps {
	user: Participant;
	isOpen: boolean;
	onClose: (action?:PopOverActions) => void;
	channelId: number;
}

export default EditUser;