import React, { useState, useEffect } from 'react';

interface CountdownProps {
	endDate: Date;
}

import styles from './countdown.module.css';

const Countdown: React.FC<CountdownProps> = ({ endDate }) => {
	const [remainingTime, setRemainingTime] = useState(endDate.getTime() - Date.now());

	useEffect(() => {
		const interval = setInterval(() => {
			const currentTime = Date.now();
			const timeDifference = endDate.getTime() - currentTime;
			setRemainingTime(timeDifference > 0 ? timeDifference : 0);
		}, 1000);

		return () => clearInterval(interval);
	}, [endDate]);

	const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
	const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

	return (
		<div className={styles.countdown}>
			{remainingMinutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
		</div>
	);
};

export default Countdown;