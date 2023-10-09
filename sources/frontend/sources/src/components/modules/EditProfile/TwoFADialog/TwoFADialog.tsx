import React from 'react';
import Dialog from '../../../common/dialog/dialog';
import { Button } from '@mui/material';
import {confirmTwoFA} from '../../../../services/auth';
import styles from './TwoFADialog.module.css';


const TwoFADialog = (props: GameDialogProps) => {
	const { open, onClose, data, update} = props;

	const genGameImage = ():JSX.Element => (
		<div id={styles.gameImage}>
			<img
				style={{
					objectFit: "contain"
				}}
				width={200}
				height={200}
				src={`${data}`}
				alt={`2FACode`}
			/>
		</div>
	);

	const handleConfirm = () => {
		confirmTwoFA(true);
		update(true);
		onClose();
	}

	const handleCancel = () => {
		confirmTwoFA(false);
		onClose();
	}
	return (
		<Dialog
			title={"Activate 2FA"}
			open={open}
			onClose={onClose}
			buttons={
				<>
					<Button onClick={handleCancel} variant="outlined">Cancel</Button>
					<Button onClick={handleConfirm} variant="contained">Confirm</Button>
				</>
			}
			leftElement={genGameImage()}
			dialogProps={{
				id: styles.dialog,
				maxWidth: "md"
			}}
		>
			<p className={styles.customSb}>
				Open your authenticator app and scan the QR code.
			</p> 
		</Dialog>
	);
};

interface GameDialogProps {
	open: boolean;
	onClose: () => void;
	data: string|undefined;
	update: (value: boolean) => (void)
}

export default TwoFADialog;