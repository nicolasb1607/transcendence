import type { gameTheme } from "../types/theme";

import theOrderLogo from '../../assets/image/coa/the-order.svg';
import theOrderLogoColor from '../../assets/image/coa/the-order-color.svg';

export const orderTheme:gameTheme = {
	name: 'The Order',
	theme: {
		pad: [
			{
				color: 0xf2e122
			},
			{
				color: 0xffffff
			}
		],
		background: "linear-gradient(286deg, #FF6950 37.93%, #E24782 88.71%)",
		backgroundImage: theOrderLogo,
		coalitionImage: theOrderLogoColor,
	}
}