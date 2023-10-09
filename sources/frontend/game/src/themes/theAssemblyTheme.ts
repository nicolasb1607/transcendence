import type { gameTheme } from "../types/theme";

import theAssemblyLogo from '../../assets/image/coa/the-assembly.svg';
import theAssemblyLogoColor from '../../assets/image/coa/the-assembly-color.svg';

export const assemblyTheme:gameTheme = {
	name: 'The Assembly',
	theme: {
		pad: [
			{
				color: 0x3C1053
			},
			{
				color: 0x3C1053
			}
		],
		background: "linear-gradient(124deg, #A061D1 44.11%, #FF079C 148.34%)",
		backgroundImage: theAssemblyLogo,
		coalitionImage: theAssemblyLogoColor
	}
}