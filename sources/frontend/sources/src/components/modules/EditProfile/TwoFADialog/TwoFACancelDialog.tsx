import React from 'react';
import Dialog from '../../../common/dialog/dialog';
import { Button } from '@mui/material';
import {confirmTwoFA} from '../../../../services/auth';

import styles from './TwoFADialog.module.css';

const TwoFACancelDialog = (props: GameDialogProps) => {
	const { open, onClose, update} = props;

	const handleConfirm = () => {
		confirmTwoFA(false);
		update(false);
		onClose();
	}

	const handleCancel = () => {
		confirmTwoFA(true);
		onClose();
	}

	return (
		<Dialog
			title={"Disabling 2FA"}
			open={open}
			onClose={onClose}
			buttons={
				<>
					<Button onClick={handleCancel} variant="outlined">Cancel</Button>
					<Button onClick={handleConfirm} variant="contained">Confirm</Button>
				</>
			}
			dialogProps={{
				id: styles.dialogDisable,
			}}
		>
			<p className={styles.customSb}>
				Are you sure you want to disable 2FA?
			</p>
		</Dialog>
	);
};

interface GameDialogProps {
	open: boolean;
	onClose: () => void;
	update: (value: boolean) => (void)
}

export default TwoFACancelDialog;