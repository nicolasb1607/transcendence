import React, { useContext } from 'react';

import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ThemeContext } from '../ThemePicker/theme';

import styles from "./EditProfile.module.css"

const ThemePicker = () => {
	const { theme, changeTheme } = useContext(ThemeContext);
	const coaArray:SiteTheme[] = ["federation", "order", "assembly", "alliance"];

	const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		changeTheme(event.target.value as SiteTheme);
	}

	const genThemePickerToggle = (name:SiteTheme): JSX.Element => {
		const color = `var(--${name.toLowerCase()})`;
		const isSelected = theme === name;
		return (
			<button 
				className={styles.themePicker}
				style={{
					borderColor: isSelected ? `${color}` : "transparent",
				}}
				onClick={() => changeTheme(name)}
				key={name}
			>
				<FormControlLabel
					sx={{ gap: "5px" }}
					value={name}
					control={
						<Radio
							sx={{
								'& .MuiSvgIcon-root:first-of-type': {
									color,
								},
								'& .MuiSvgIcon-root:last-child': {
									color
								}
							}}
						/>
					}
					label={name}
				/>
				<img className={styles.imgThemePicker} src={`/themePicker/${name}.svg`} alt="" />
			</button>
		);
	}


	return (
		<RadioGroup
			row
			className={styles.themePickerContainer}
			defaultValue="federation"
			onChange={handleThemeChange}
			value={theme}
		>
			{coaArray.map(element => genThemePickerToggle(element))}
		</RadioGroup>
	);
};
export default ThemePicker;