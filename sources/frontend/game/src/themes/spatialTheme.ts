import type { gameTheme } from "../types/theme";

import space from '../../assets/image/space-bg.jpg';

export const spatialTheme:gameTheme = {
	name: 'Spatial',
	theme: {
		pad: [
			{
				color: 0x0575E6
			},
			{
				color: 0x0575E6
			}
		],
		background: `url(${space})`,
		backgroundStyle: {
			backgroundSize: 'cover'
		}
	}
}