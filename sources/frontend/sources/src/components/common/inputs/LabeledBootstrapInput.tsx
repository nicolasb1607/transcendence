import React from 'react';
import BootstrapInput from './BootstrapInput';
import { FormControl, Grow, InputLabel } from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";

import type { InputBaseProps } from '@mui/material/InputBase';
import type { TypeBackground, SxProps, Theme } from '@mui/material/styles';

/**
 *  * MUI component API:
 *
 * - [Input API](https://mui.com/material-ui/api/input-base/)
 * - [FormControl API](https://mui.com/material-ui/api/form-control/)
 */
const LabeledBootstrapInput = (props: LabeledBootstrapInputProps) => {
	const { label, defaultValue, inputProps, formHelper, formSx,
		backgroundColor, error } = props;

	return (
		<FormControl variant="standard" sx={formSx} error={error}>
			<InputLabel shrink htmlFor={inputProps?.name} sx={{fontSize:18}}>
				{label}
			</InputLabel>
			<BootstrapInput
				defaultValue={defaultValue}
				{...(inputProps ? inputProps : {})}
				id={inputProps?.name}
				background={backgroundColor}
			/>
			{formHelper ? (
				<Grow in={Boolean(formHelper)}>
					<FormHelperText>{formHelper}</FormHelperText>
				</Grow>
			) : undefined}
		</FormControl>
	);
}

export interface LabeledBootstrapInputProps {
	label: string;
	defaultValue?: string;
	formHelper?: string;
	inputProps?: InputBaseProps;
	formSx?: SxProps<Theme>;
	backgroundColor?: keyof TypeBackground;
	error?: boolean;
}

export default LabeledBootstrapInput;