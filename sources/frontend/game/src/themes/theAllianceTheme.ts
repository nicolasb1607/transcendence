import type { gameTheme } from "../types/theme";

import theAllianceLogo from '../../assets/image/coa/the-alliance.svg';
import theAllianceLogoColor from '../../assets/image/coa/the-alliance-color.svg';

export const allianceTheme:gameTheme = {
	name: 'The Alliance',
	theme: {
		pad: [
			{
				color: 0x0575E6
			},
			{
				color: 0x0575E6
			}
		],
		background: "#33C47F",
		backgroundImage: theAllianceLogo,
		coalitionImage: theAllianceLogoColor
	}
}