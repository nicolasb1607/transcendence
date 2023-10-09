import type { ColorRepresentation } from "three";

export type gameThemeType = 'classic' |  "The Federation" | "The Order" | "The Assembly" | "The Alliance" | 'Tron' | 'Spatial';
type cssString = string;

interface padTheme {
	color: ColorRepresentation;
}

export interface gameTheme {
	name: gameThemeType,
	theme: {
		// Require at least 2 pad 
		pad?: [
			padTheme,
			padTheme,
			...padTheme[]
		];
		ballColor?: ColorRepresentation;
		background?: cssString;
		backgroundStyle?: Partial<CSSStyleDeclaration>;
		backgroundImage?: string;
		coalitionImage?: string;
	}
}