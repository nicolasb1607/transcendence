/* eslint-disable @typescript-eslint/no-unused-vars */

type Coalition =  "federation" | "order" | "assembly" | "alliance";
type SiteTheme = Coalition;

type SubTheme = `${SiteTheme}-light` | `${SiteTheme}-dark`;

interface ThemeContext {
	theme: SiteTheme;
	changeTheme: (theme: SiteTheme) => void;
}