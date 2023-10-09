import { type Theme, alpha, styled, type TypeBackground } from '@mui/material/styles';
import Select, { type SelectProps } from '@mui/material/Select';

type BootstrapSelectProps = SelectProps & {
	theme?: Theme;
	background?: keyof TypeBackground;
};

export const BootstrapSelect:React.ElementType<BootstrapSelectProps> = styled(Select)<BootstrapSelectProps>(({ theme, background = "default" }) => ({
	'label + &': {
		marginTop: theme.spacing(3),
	},
	'& .MuiInputBase-input': {
		borderRadius: 4,
		position: 'relative',
		backgroundColor: theme.palette.background[background],
		border: 0,
		fontSize: 16,
		width: '100%',
		padding: '10px 12px',
		transition: theme.transitions.create([
			'border-color',
			'background-color',
			'box-shadow',
		]),
		// Use the system font instead of the default Roboto font.
		fontFamily: [
			'Lato',
			'Roboto',
			'Sans-serif'
		].join(','),
		'&:focus': {
			boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
			borderColor: theme.palette.primary.main,
		},
	},
	'&::before': {
		borderBottom: 'none',
	}
}));