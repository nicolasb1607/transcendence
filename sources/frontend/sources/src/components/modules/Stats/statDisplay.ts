import type { statsDisplayConfig } from "../../../types/stats";

/**
 * @param playTime Express in seconds
 * @returns Duration in format: 22.22h
 */
export const convertPlayTime = (playTime: number|undefined): string => {
	if (!playTime) return ('0.00h');
	const hours = Math.floor(playTime / 3600);
	const minutes = Math.floor((playTime - (hours * 3600)) / 60);
	return (hours + '.' + minutes + 'h');
}

export const statsDisplay:statsDisplayConfig = {
	score: {
		name: "Total Score",
	},
	play_time: {
		convert: convertPlayTime,
	},
	win_rate: {
		display: false
	},
	total_game: {
		display: false
	}
}