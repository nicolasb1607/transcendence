import { gameType } from "../types/GameDataTypes";
import { orderTheme, allianceTheme, federationTheme, assemblyTheme, tronTheme, classicTheme, spatialTheme } from "./index";

export const handleTheme = (type: gameType) => {
	//replace by query selector
	// const localStorageClassicGameMode = localStorage.getItem('classicGameMode');
	const theme = type === 'classic' ? 'classic' : 'custom';
	if (!theme || theme !== 'custom') return (classicTheme);
	const themes = [orderTheme, allianceTheme, federationTheme, assemblyTheme, tronTheme, spatialTheme];
	//return random
	return (themes[Math.floor(Math.random() * themes.length)]);
}
