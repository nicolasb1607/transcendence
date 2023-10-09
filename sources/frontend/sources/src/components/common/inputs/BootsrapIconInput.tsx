import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import type { InputBaseProps } from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';

type InputProps = InputBaseProps & {
	theme?: Theme;
};

const BootstrapIconInput:React.ElementType<InputProps> = styled(InputBase)<InputProps>(({ theme }) => ({
	'label + &': {
		marginTop: theme.spacing(3),
	},
	'&': {
		borderRadius: 4,
		backgroundColor: theme.palette.background.default,
		transition: theme.transitions.create([
			'border-color',
			'background-color',
			'box-shadow',
		]),
		overflow: 'hidden',
	},
	'&.Mui-focused': {
		boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
		borderColor: theme.palette.primary.main,
	},
	'& .MuiInputBase-input': {
		position: 'relative',
		backgroundColor: theme.palette.background.default,
		fontSize: 16,
		width: '100%',
		padding: '10px 12px',
		// Use the system font instead of the default Roboto font.
		fontFamily: [
			'Lato',
			'Roboto',
			'Sans-serif'
		].join(','),
	},
	'& .MuiInputAdornment-root': {
		cursor: 'pointer',
		color: theme.palette.primary.main,
	},
	'& .MuiInputAdornment-root:hover': {
		color: theme.palette.primary.dark,
	}
}));

export default BootstrapIconInput;