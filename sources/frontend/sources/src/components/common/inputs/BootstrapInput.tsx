import { alpha, styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

import type { InputBaseProps } from '@mui/material/InputBase';
import type { TypeBackground, Theme } from '@mui/material/styles';

type InputProps = InputBaseProps & {
	theme?: Theme;
	background?: keyof TypeBackground;
};

const BootstrapInput:React.ElementType<InputProps> = styled(InputBase)<InputProps>(({ theme, background = "default" }) => ({
	'&': {
		backgroundColor: theme.palette.background[background],
		borderRadius: 4,
		padding: '6px 12px',
		transition: theme.transitions.create([
			'border-color',
			'background-color',
			'box-shadow',
		]),
	},
	'&.Mui-focused': {
		boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
		borderColor: theme.palette.primary.main,
	},
	'& button': {
		background: "unset",
		color: "var(--text)",
	},
	'label + &': {
		marginTop: theme.spacing(3),
	},
	'& .MuiInputBase-input': {
		position: 'relative',
		border: 0,
		fontSize: 16,
		width: 'auto',
		flex: 1,
		// Use the system font instead of the default Roboto font.
		fontFamily: [
			'Lato',
			'Roboto',
			'Sans-serif'
		].join(','),
	},
}));

export default BootstrapInput;