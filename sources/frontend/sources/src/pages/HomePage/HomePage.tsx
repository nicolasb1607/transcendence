import React, { useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

import style from './HomePage.module.css';
import homepageData from '../../data/homepage.json';

const HomePage = () => {
	const charactersContainer = useRef<HTMLDivElement>(null);
	const charactersRef = useRef<HTMLImageElement>(null);


	useEffect(() => {

		
		function onMouveMove(e: MouseEvent) {
			if (charactersRef.current) {
				const offsetX = (e.pageX - charactersRef.current.offsetWidth / 2) / (charactersRef.current.offsetWidth / 2);
				const offsetY = (e.pageY - charactersRef.current.offsetHeight / 2) / (charactersRef.current.offsetHeight / 2);
				const X = Math.max(Math.min(offsetX, 1), -1);
				const Y = Math.max(Math.min(offsetY, 1), -1);
				charactersRef.current.style.transform = `translateX(-5%) translate(${X * 20}px, ${Y * 20}px)`;
			}
		}

		charactersContainer.current?.addEventListener('mousemove', onMouveMove);

		return () => {
			charactersContainer.current?.removeEventListener('mousemove', onMouveMove);
		}
	}, []);

	const genHead = () => {
		return (
			<Helmet>
				<title>Transcendance | Homepage</title>
				<link rel="preload" href="/bg_characters-min-L.png" as="image" />
				<link rel="preload" href="/mountains-min-L.png" as="image" />
			</Helmet>
		);
	}

	const genButton = (data: TextAreaData) => {
		if (!data.textButton || data.textButton === "") {
			return ;
		}
		if (data.link){
			return (
				<Link to={data.link}>
					<a><Button variant="contained">{data.textButton}</Button></a>
				</Link>
			)
		}
		return (
			<Button variant="contained">{data.textButton}</Button>
		)
	}

	const genTextArea = (data: TextAreaData): JSX.Element => {
		const { imgSrc, alt, title, text } = data;
		return (
			<div className={style.textArea}>
				{imgSrc ? <img src={imgSrc} alt={alt} /> : null}
				<h2>{title}</h2>
				<hr className={style.solid} />
				<p>{text}</p>
				{genButton(data)}
			</div>
		);
	};

	const genAuthorLink = (text:string, link:string) => (
		<a href={link} target="_blank" rel="noreferrer">
			<span>{text}</span>
		</a>
	)

	return (
		<div id={style.content}>
			{genHead()}
			<section id={style.homepageWallpaper} className={style.withBorder} ref={charactersContainer}>
				<img alt="Astronauts" src="/bg_characters-min-L.png" id={style.astronautsImage} ref={charactersRef}/>
				<img alt="Mountains" src="/mountains-min-L.png" id={style.mountainsImage} />
				<h1>Spatial Pong</h1>
			</section>
			<section className={style.splitCenterArea}>
				{genTextArea(homepageData[0])}
				<div style={{overflow:"hidden"}}>
					<video 
						autoPlay
						muted
						loop
						playsInline
						id={style.pongIllustration}
						src="/output.webm"
					/>
				</div>
			</section>
			<section className={style.withBorder}>
				<div id={`${style.lizardContent}`} className={style.splitCenterArea}>
					<div>
						<img src="/lizard-min.png" id={style.lizardsImage} alt="astronaut portrait" />
					</div>
					{genTextArea(homepageData[1])}
				</div>
			</section>
			{/* eslint-disable-next-line*/}
			<section className={style.splitCenterArea}>
				{genTextArea(homepageData[2])}
				<div>
					<div id={style.achievement}>
						<img
							src="/achievement.png"
							id={style.achievementImage}
							alt="achievement"
							loading='lazy'
							width={460}
							height={420}
						/>
					</div>
				</div>
			</section>
			<section className={style.withBorder}/>
			<section className={`${style.withBorder} ${style.end}`}>
				<div className={style.army}>
					{/* eslint-disable-next-line */}
					<div>
					</div>
					{/* eslint-disable-next-line */}
					<div className={style.armyContent}>
						{genTextArea(homepageData[3])}
					</div>
				</div>
			</section>
			<footer className={style.footer}>
				<span>Made with <span>♥</span> and tears, by {genAuthorLink("Jcervoni", "https://profile.intra.42.fr/users/jcervoni")}, {genAuthorLink("Seciurte","https://profile.intra.42.fr/users/seciurte")}, {genAuthorLink("Nburat-d","https://profile.intra.42.fr/users/nburat-d")}, {genAuthorLink("Rpottier","https://profile.intra.42.fr/users/rpottier")}, {genAuthorLink("Bboisset","https://profile.intra.42.fr/users/bboisset")}</span>
			</footer>
		</div>
	);
};

export default HomePage;