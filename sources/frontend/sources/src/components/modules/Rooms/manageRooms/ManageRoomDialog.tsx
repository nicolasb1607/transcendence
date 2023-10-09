import React, {useState, cloneElement, useEffect} from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Button } from '@mui/material';

import Dialog from '../../../common/dialog/dialog';
import GettingStarted from './GettingStarted';
import PickAnImage from './PickAnImage';
import InvitePeoples from './InvitePeoples';
import {validateCreateRoomForm} from './assertFields';
import { createChannel, getChannelById, removeChannel } from '../../../../services/chat';

import styles from './ManageRoomsDialog.module.css';
import { useSnackbar } from 'notistack';

const manageRoomSteps = [
	{
		name: "Getting Started",
		//@ts-expect-error Props are defined when used
		component: <GettingStarted/>,
		description: "Set up your preferred chat rooms and start talking with your friends and opponents. You will have the ability to modify these settings in the future."
	},
	{
		name: "Pick an image",
		//@ts-expect-error Props are defined when used
		component: <PickAnImage/>,
		description: "Choose an image to customize your channel and enhance your communication experience. You can easily modify this image selection at any time to suit your preferences."
	},
	{
		name: "Invite peoples",
		//@ts-expect-error Props are defined when used
		component: <InvitePeoples/>,
		description: "Invite people to join and participate in your channel. Easily connect with friends, colleagues, or community members by sending them invitations."
	}
]

const defaultRoomForm:CreateRoomForm = {
	name: "",
	type: "public",
	image: "",
	participants: [],
	password: "",
	passwordConfirmation: "",
	previousParticipants: undefined,
}

/**
 * Use to create and update channels
 */
const ManageRoomsDialog = (manageRoomsDialogProps:ManageRoomsDialogProps) => {
	const [activeStep, setActiveStep] = useState(0);
	const [formErrors, setFormErrors] = useState<ValidateCreateRoomFormResponse | null>(null);
	const [newRoom, setNewRoom] = useState<CreateRoomForm>(defaultRoomForm);
	const { enqueueSnackbar } = useSnackbar();
	const {open, onClose, edit, roomId} = manageRoomsDialogProps;

	/**
	 * Define newRoom when edit is true
	 * by using the room prop
	 */
	useEffect(() => {
		if (edit === true && roomId){
			const getChannel = async (roomId:number) => {
				const currentRoom = await getChannelById(roomId);
				if (!currentRoom || "error" in currentRoom) {
					setFormErrors({valid: false, error: "Room not found", failingStep: 0});
					return;
				}
				setNewRoom({
					...newRoom,
					name: currentRoom.name,
					type: currentRoom.type as ChatType,
					image: currentRoom.image,
					previousParticipants: currentRoom.participants as RoomMember[],
					ownerId: currentRoom.ownerId
				})
			}
			getChannel(roomId);
		}
	}, [edit, roomId])

	const handleClose = (reload?:boolean) => {
		onClose(reload);
		setFormErrors(null);
		setActiveStep(0);
		setNewRoom(defaultRoomForm);
	}

	const genStepper = () => (
		<Stepper activeStep={activeStep} alternativeLabel>
			{manageRoomSteps.map((step, index) => {
				const isStepFailed = Boolean(formErrors && index === formErrors?.failingStep);
				return (
					<Step key={step.name}>
						<StepLabel
							error={isStepFailed}
							optional={isStepFailed ? (
								<span className={styles.errorText}>{formErrors?.error}</span>
							) : undefined}
						>{step.name}</StepLabel>
					</Step>
				)
			})}
		</Stepper>
	)

	const handleRemove = async () => {
		if (!roomId) return;
		const confirm = window.confirm("Are you sure you want to remove this room?")
		if (!confirm) return;
		if (await removeChannel(roomId)){
			enqueueSnackbar(`Room ${newRoom.name} removed`, { variant: 'success' });
		} else {
			enqueueSnackbar("An error occurred while removing the room", { variant: 'error' });
		}
		handleClose(true);
	}

	//Called when the user click on the create button
	const handleCreateRoom = async () => {
		delete newRoom.previousParticipants;
		delete newRoom.passwordConfirmation;
		delete newRoom.ownerId
		const createdRoom = edit ? await createChannel(newRoom, "PUT", roomId || -1) : await createChannel(newRoom);
		if (createdRoom && "ID" in createdRoom){
			enqueueSnackbar(edit ? `Room ${newRoom.name} updated` : `Room ${newRoom.name} created`, { variant: 'success' });
			handleClose(true);
		} else {
			enqueueSnackbar("An error occurred while creating the room", { variant: 'error' });
		}
	}

	const handleNext = () => {
		const formValidity = validateCreateRoomForm(newRoom, activeStep);
		setFormErrors(formValidity);
		if (!formValidity.valid) return;
		if (activeStep === manageRoomSteps.length - 1) {
			handleCreateRoom();
			return;
		}
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	}

	const handleBack = () => {
		if (activeStep === 0) {
			handleClose();
			return;
		}
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	}

	const handleFormUpdate = (newForm: Partial<CreateRoomForm>) => {
		if (newRoom.type !== "protected" && newForm.type !== "protected"){
			delete newForm.password;
			delete newForm.passwordConfirmation;
		}
		setNewRoom({...newRoom, ...newForm});
	}

	const genButtons = () => {
		const goBackText = activeStep === 0 ? "Cancel" : "Back";
		const endText = edit ? "Update" : "Create";
		const goNextText = activeStep === manageRoomSteps.length - 1 ? endText : "Continue";
		return (
			<>
				{edit && roomId ? (
					<Button
						variant="outlined"
						onClick={handleRemove}
						color="error"
					>Leave</Button>
				) : undefined}
				{edit && roomId ? (
					<Button
						variant="outlined"
						onClick={handleRemove}
						color="error"
					>Remove</Button>
				) : undefined}
				<Button variant="outlined" onClick={handleBack}>{goBackText}</Button>
				<Button variant="contained" onClick={handleNext}>{goNextText}</Button>
			</>
		)
	}

	const dialogTitle = edit ? "Edit a room" : "Create a room";
	return (
		<Dialog
			title={dialogTitle}
			open={open}
			onClose={handleClose}
			buttons={genButtons()}
			dialogProps={{
				maxWidth: "md",
			}}
		>
			{genStepper()}
			<div id={styles.stepContent}>
				<p>{manageRoomSteps[activeStep].description}</p>
				{cloneElement(manageRoomSteps[activeStep].component, {
					currentRoom: newRoom,
					updateCurrentRoom: handleFormUpdate
				})}
			</div>
		</Dialog>
	);
};

interface ManageRoomsDialogProps {
	open: boolean;
	onClose: (reload?:boolean) => void;
	/**
	 * If true, the dialog will be in edit mode
	 */
	edit: boolean;
	/**
	 * If edit is true, the room to edit
	 */
	roomId: number|null;
}

export default ManageRoomsDialog;