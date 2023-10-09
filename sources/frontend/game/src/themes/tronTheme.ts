import type { gameTheme } from "../types/theme";

import tronBg from '../../assets/image/tron-bg.svg';

export const tronTheme:gameTheme = {
	name: 'Tron',
	theme: {
		pad: [
			{
				color: 0x01C2FF
			},
			{
				color: 0xCE3D87
			}
		],
		ballColor: 0x06C270,
		background: `url(${tronBg})`,
		backgroundStyle: {
			backgroundSize: 'cover'
		}
	}
}