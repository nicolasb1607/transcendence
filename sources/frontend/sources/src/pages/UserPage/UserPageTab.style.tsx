const tabstyle = {
	'&': {
		width: '100%',
		overflow: "hidden",
		borderRadius: "8px",
		boxShadow: 3
	},
	'& .MuiButtonBase-root': {
		fontWeight: "600!important",
		fontFamily: "Lato, Roboto, Arial"
	},
	'& .MuiTabs-flexContainer': {
		display: "flex",
		backgroundColor: "#142D4A",
		padding: "5px"
	},
	'& #settings': {
		marginLeft: "auto"
	},
	'& div': {
		width: 'calc(100% - 10px)'
	},
	'& .MuiButtonBase-root.MuiTab-root': {
		minHeight: '48px',
	},
	'& .MuiTab-textColorPrimary': {
		fontWeight: "500",
		borderRadius: "8px",
		color: "white",
		maxHeight: "48px"
	},
}

export default tabstyle;