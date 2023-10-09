import React, {useState} from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LabeledBootstrapInput, { type LabeledBootstrapInputProps } from './LabeledBootstrapInput';

const PasswordInput = (props: LabeledBootstrapInputProps) => {
	const [showPassword, setShowPassword] = useState(false);

	const handClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		setShowPassword(!showPassword);
	}

	const genAdornment = () => (
		<button onClick={handClick}>
			{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
		</button>
	)

	return (
		<LabeledBootstrapInput
			{...props}
			inputProps={{
				...props.inputProps,
				type: showPassword ? 'text' : 'password',
				endAdornment: genAdornment(),
				className: props.inputProps?.className + " password-input"
			}}
		/>
	);
};

export default PasswordInput;