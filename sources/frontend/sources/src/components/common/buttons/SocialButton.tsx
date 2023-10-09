import React from 'react';

import styles from './SocialButton.module.css';
import socialButton from './socialButton.json';

const SocialButton = (props: SocialButtonProps) => {
	const { type, size, onClick } = props;
	
	const selectedButton = socialButton[type];
	const buttonClass = [styles.socialButton];
	
	if (size) {
		buttonClass.push(styles[size]);
	}

	// Appeler onClick lors du clic sur le bouton
	const handleButtonClick = () => {
		onClick(type); // Ici, nous passons le type du bouton en argument à la fonction onClick
	};

	return (
		<button onClick={handleButtonClick} style={{ backgroundColor: selectedButton.background }} className={buttonClass.join(" ")}>
			<img src={selectedButton.iconSrc} alt={type} />
			<span>{size !== "small" ? "Continue with " : ""}{type}</span>
		</button>
	);
};

interface SocialButtonProps {
	type: 'google' | '42 school'
	size?: 'small' | 'fill'
	onClick: (type: 'google' | '42 school') => void;
}

export default SocialButton;