import React, {useState} from 'react';
import BootstrapIconInput from '../../common/inputs/BootsrapIconInput';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';

import styles from './Tchat.module.css';

const TchatInputArea = (props: TchatInputAreaProps) => {
	const [message, setMessage] = useState<string>("");

	const handleSend = () => {
		if (message.length === 0) return;

		props.onSend(message);
		setMessage("");
	}

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSend();
		}
	}


	return (
		<div id={styles.tchatInputArea}>
			<BootstrapIconInput
				placeholder="Type your message here..."
				sx={{
					backgroundColor: 'var(--background)!important',
					paddingRight: "12px",
					borderRadius: "4px",
				}}
				endAdornment={
					<InputAdornment position="end" onClick={handleSend}>
						<SendIcon />
					</InputAdornment>
				}
				fullWidth
				onChange={(e) => setMessage(e.target.value)}
				onKeyDown={handleInputKeyDown}
				value={message}
			/>
		</div>
	)
};

interface TchatInputAreaProps {
	onSend: (message: string) => void;
}

export default TchatInputArea;