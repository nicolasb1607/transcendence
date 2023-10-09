import type { gameTheme } from "../types/theme";

export const classicTheme:gameTheme = {
	name: 'classic',
	theme: {
		pad: [
			{
				color: 0xffffff
			},
			{
				color: 0xffffff
			}
		],
		ballColor: 0xffffff,
		background: `black`,
		backgroundStyle: {
			backgroundSize: 'contain',
		}
	}
}