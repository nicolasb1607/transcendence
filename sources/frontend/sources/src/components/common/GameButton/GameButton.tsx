import React from 'react';
import styles from './GameButton.module.css';
import { Link } from "wouter";

const imageSize = 28;

const GameButton = ({ imgSrc, alt, gameName, href }: { imgSrc: string, alt: string, gameName: string, href: string }): JSX.Element => {
	return (
		<Link href={href}>
			<div className={styles.GameButton}>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<img src={imgSrc} alt={alt} width={imageSize} height={imageSize}/>
				</div>
				<div>
					<span>{gameName}</span>
				</div>
			</div>
		</Link>
	);
};

export default GameButton;