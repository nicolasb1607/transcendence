import React from 'react';
import { Dialog as MuiDialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { DialogProps as MuiDialogProps } from '@mui/material/Dialog';

const Dialog = (props: DialogProps):JSX.Element => {
	const {open, onClose, title, buttons, children, dialogProps} = props;

	const genTopPart = () => (
		<>
			<DialogTitle
				sx={{
					'&.MuiTypography-root': {
						fontSize:28,
						fontWeight:600,
						padding: 0,
						color: "var(--text)",
					}
				}}
			>{title}</DialogTitle>
			<hr style={{border:"1px solid #284566",width:"100%"}}/>
			<DialogContent
				style={{
					padding: "8px 0"
				}}
			>
				{children}
			</DialogContent>
		</>
	)

	return (
		<MuiDialog
			sx={{
				'& .MuiDialog-container .MuiPaper-root': {
					padding: "20px 24px!important",
					overflow: "hidden"
				},
				'& 	.MuiDialog-paper': {
					backgroundColor: "var(--background-light)",
					backgroundImage: "none!important"
				},
			}
			}
			open={open}
			onClose={onClose}
			{...dialogProps}
		>
			<div id="dialogContent">
				{props?.leftElement}
				{props?.leftElement ? (
					<div id="topPart">
						{genTopPart()}
					</div>
				) : genTopPart()}
			</div>
			<hr style={{
				border:"1px solid #284566",
				marginBottom: "15px",
				width: "calc(100% + 48px)",
				translate: "-24px"
			}}
			/>
			<DialogActions
				sx={{
					'&.MuiDialogActions-root > button': {
						fontWeight: 600,
					}
				}}
			>
				{buttons}
			</DialogActions>
		</MuiDialog>
	)
}

interface DialogProps {
	open: boolean;
	onClose: () => void;
	title: string;
	buttons?: JSX.Element;
	children?: JSX.Element | JSX.Element[];
	dialogProps?: Partial<MuiDialogProps>;
	leftElement?: JSX.Element;
}

export default Dialog;
