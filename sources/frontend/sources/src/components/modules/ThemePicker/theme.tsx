import React, { createContext, useState } from "react";

const availableThemes = ["federation", "order","assembly","alliance"];

export const ThemeContext = createContext<ThemeContext>({
	theme: "federation",
	changeTheme: (theme: SiteTheme) => {
		console.log(theme);
	}
})

const localTheme = localStorage.getItem("theme") as SiteTheme;
const defaultTheme = availableThemes.includes(localTheme) ? localTheme : "federation";

const ThemeProvider = (props:ThemeProviderProps) => {
	const [theme, setTheme] = useState<SiteTheme>(defaultTheme);

	const changeTheme = (theme: SiteTheme) => {
		localStorage.setItem("theme", theme);
		setTheme(theme);
	}
	
	return (
		<ThemeContext.Provider value={{ theme, changeTheme }}>
			{props.children}
		</ThemeContext.Provider>
	);
}

export default ThemeProvider;

interface ThemeProviderProps {
	children: React.ReactNode;
}