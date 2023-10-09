import React from 'react';
import { BootstrapSelect } from './BootstrapSelect';
import { FormControl, InputLabel, type SelectProps, type SxProps, type Theme } from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";

const LabeledBootstrapSelect = (props: LabeledBootstrapSelectProps) => {
	const { label, selectProps, formHelper, formSx } = props;

	return (
		<FormControl variant="standard" sx={formSx}>
			<InputLabel shrink htmlFor="bootstrap-select">
				{label}
			</InputLabel>
			<BootstrapSelect
				{...selectProps}
				sx={{
					'& .MuiInputBase-input': {
						width: '100%',
					},
					'& .MuiInputBase-root:before': {
						borderBottom: 'none',
					},
					'& option': {
						backgroundColor: 'var(--background)',
						color: 'var(--text)',
					},
					'& .MuiInputBase-input:focus': {
						borderRadius: 1
					}
				}}
			>
				{props.children}
			</BootstrapSelect>
			{formHelper ? <FormHelperText>{formHelper}</FormHelperText> : null}
		</FormControl>
	);
}

interface LabeledBootstrapSelectProps {
	label: string;
	formHelper?: string;
	selectProps?: SelectProps;
	children: React.JSX.Element[];
	formSx?: SxProps<Theme>;
}
export default LabeledBootstrapSelect;