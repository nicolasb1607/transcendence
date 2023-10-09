import React, {useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import PasswordInput from '../../common/inputs/PasswordInput';

import styles from './Tchat.module.css';
import { joinChannel } from '../../../services/chat';

const ProtectedChannelDialog = (props: ProtectedChannelDialogProps) => {
	const { open, onClose, channelId } = props;
	const [error, setError] = useState<string|null>(null);

	const genHead = () => (
		<div id={styles.passHead}>
			<h3>Enter Password</h3>
			<span>This channel is protected by a password</span>
		</div>
	)

	const genActions = () => (
		<DialogActions>
			<Button color="primary" onClick={() => onClose()}>
				Cancel
			</Button>
			<Button color="primary" variant="contained" type="submit">
				Join
			</Button>
		</DialogActions>
	)

	const handleSumbit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const password = form.get('password');
		if (!password || password.length < 1) return;
		console.log(password)
		const response = await joinChannel(channelId, password.toString());
		if (response === true){
			onClose(true, channelId);
		} else if (response && response.error === "WrongPassword"){
			setError("Wrong password");
		}
	}

	return (
		<Dialog
			id={styles.editUser}
			open={open}
			onClose={() => onClose}
		>
			<form onSubmit={handleSumbit}>
				<DialogContent>
					{genHead()}
					<PasswordInput
						label="Password"
						inputProps={{
							type: "password",
							placeholder: "Enter password",
							autoComplete: "off",
							name: "password"
						}}
						backgroundColor='paper'
						formHelper={error || ""}
					/>
				</DialogContent>
				{genActions()}
			</form>
		</Dialog>
	);
};

interface ProtectedChannelDialogProps {
	open: boolean;
	onClose: (success?:boolean, channelId?:number) => void;
	channelId: number;
}

export default ProtectedChannelDialog;