import type { gameTheme } from "../types/theme";

import theFederationLogo from '../../assets/image/coa/the-federation.svg';
import theFederationLogoColor from '../../assets/image/coa/the-federation-color.svg';

export const federationTheme:gameTheme = {
	name: 'The Federation',
	theme: {
		pad: [
			{
				color: 0xffffff
			},
			{
				color: 0xffffff
			}
		],
		background: "linear-gradient(124deg, #4180DB 15.99%, #38BEB6 103.04%)",
		backgroundImage: theFederationLogo,
		coalitionImage: theFederationLogoColor
	}
}