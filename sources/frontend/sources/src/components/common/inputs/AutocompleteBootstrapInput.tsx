import React, {useState, useEffect} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField, type TextFieldProps } from '@mui/material';
import { FormControl, InputLabel, FormHelperText } from '@mui/material';
import type {SxProps, Theme} from '@mui/system';
import type {AutocompleteProps, AutocompleteRenderInputParams} from '@mui/material/Autocomplete';

const textFieldSx = {
	backgroundColor: "var(--background)",
	marginTop: '24px',
	borderRadius: '4px',
	'& .MuiOutlinedInput-root': {
		padding: '5px',
	},
	'& input': {
		bgcolor: "var(--background)",
		padding: " 7.5px 4px 7.5px 6px"
	},
	'& fieldset': {
		border: 'none!important',
	},
	'& .MuiFormControl-root': {
		borderRadius: '4px',
	},
	'& .MuiButtonBase-root': {
		marginRight: '0px',
	}
}

/**
 * T is the type of the value that will be returned by the component.
 * Also the type of options.
 */
const AutocompleteBootstrapInput = <T,>(props: AutocompleteBootstrapInputProps<T>) => {
	const { label, formHelper, onInputChangeDebounce,
		clearInputOnSelect, autocompleteProps, inputProps } = props;
	const [inputValue, setInputValue] = useState<string>("");

	useEffect(() => {
		const timeoutId = setTimeout(() => { 
			if (onInputChangeDebounce) {
				console.log(`onInputChangeDebounce`)
				onInputChangeDebounce(inputValue);
			}
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [inputValue]);

	/**
	 * When the user type in the input, we call the onInputChange prop if it exists.
	 */
	const handleInputChange = (event:React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	}

	/**
	 * When the user select an option, we call the onChange prop if it exists.
	 */
	const handleChange = (event:React.SyntheticEvent, newValue:unknown) => {
		if (props?.onChange) props.onChange(event, newValue as T | T[] | null);
		if (clearInputOnSelect) {
			
		}
	}

	const genRenderInput = (params:AutocompleteRenderInputParams) =>  (
		<TextField
			{...params}
			{...inputProps}
			onChange={handleInputChange} 
			sx={textFieldSx}
		/>
	);

	return (
		<FormControl variant="standard"
			sx={{
				...props?.formSx,
			}}
		>
			<InputLabel shrink htmlFor="bootstrap-input" sx={{
				color: 'var(--text-detail)',
				fontSize:"1em"
			}}
			>
				{label}
			</InputLabel>
			<Autocomplete
				{...autocompleteProps}
				onChange={handleChange}
				renderInput={genRenderInput}
			/>
			{formHelper ? <FormHelperText>{formHelper}</FormHelperText> : null}
		</FormControl>
	);
};

export interface AutocompleteBootstrapInputProps<T> {
	label?: string;
	formHelper?: string;
	clearInputOnSelect?: boolean;
	//Call when an option is selected.
	onChange?: (event: React.SyntheticEvent, value: T | T[] | null) => void;
	/**
	 * Return the value of the input. If the user hasn't
	 * press any key till 500ms.
	 */
	onInputChangeDebounce?: (value: string | null) => void;
	formSx?: SxProps<Theme>;
	inputProps?: TextFieldProps;
	autocompleteProps: Omit<AutocompleteProps<T, boolean | undefined, boolean | undefined, boolean | undefined>, "renderInput" | "onChange">;
}

export default AutocompleteBootstrapInput;