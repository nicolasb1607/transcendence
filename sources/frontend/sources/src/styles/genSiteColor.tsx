import React from 'react';
import siteColors from "../data/siteColors.json"

const genSiteColor = (selectedTheme:AvailableThemes) => {
	let css = `:root {`;
	
	for (const [key, value] of Object.entries(siteColors)) {
		css += `--${key}: ${value};`;
	}
	css += `--primary: var(--${selectedTheme});`;
	css += `--primary-light: var(--${selectedTheme}-light);`;
	css += `--primary-dark: var(--${selectedTheme}-dark);`;
	css += `}`;

	return (
		<style>
			{css}
		</style>
	);
}

export default genSiteColor;