import React, { useContext } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeContext } from "../components/modules/ThemePicker/theme";

import siteColors from "../data/siteColors.json"

const Theme = (props:ThemeProps) => {
	const { theme:currentTheme } = useContext(ThemeContext);

	const theme = createTheme({
		palette: {
			mode: "dark",
			primary: {
				main: siteColors[currentTheme],
				light: siteColors[currentTheme+"-light" as SubTheme],
				dark: siteColors[currentTheme+"-dark" as SubTheme],
				contrastText: siteColors.text
			},
			background: {
				default: siteColors.background,
				paper: siteColors["background-light"]
			},
			error: {
				main: "#CF364F",
			},
			success: {
				main: "#33C47F",
			}
		}
	});

	return (
		<ThemeProvider theme={theme}>
			{props.children}
		</ThemeProvider>
	);
}

interface ThemeProps {
	children: React.ReactNode;
}

export default Theme;