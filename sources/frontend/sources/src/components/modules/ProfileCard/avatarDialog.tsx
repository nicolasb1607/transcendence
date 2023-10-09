import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import { Tabs, Tab } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Dialog from '../../common/dialog/dialog';
import ImagePicker from '../../common/imagePicker/ImagePicker';
import avatars from '../../../data/avatars.json';
import ImageInput from '../../common/inputs/ImageInput';

import styles from './ProfileCard.module.css';
import { updateAvatarInDB } from '../../../services/updateInfo';
import { Session } from '../auth/session/session';
import { useSnackbar } from 'notistack';
import { tryUpload } from '../../../services/upload';

type displayType = 'avatarSelect' | 'avatarUpload';

const allowedExtensions = ['png', 'jpeg'];

const AvatarDialog = (props: AvatarDialogProps): JSX.Element => {
	const { open, onClose, user } = props;
	const [selectedAvatar, setSelectedAvatar] = useState<string|undefined>((document.getElementById("profileCardImg")?.getAttribute("src"))?.substring(0));
	const [clickedDialogTab, setClickedDialogTab] = useState<Coalition|"all">("all");
	const [display, setDisplay] = useState<displayType>('avatarSelect');
	const [uploadedMedia, setUploadedMedia] = useState<File|undefined>();
	const sessionHandler = useContext(Session);
	const { enqueueSnackbar } = useSnackbar();

	const imageBasePath = process.env.API_URL + `avatars/`;

	const handleClose = async () => {
		if (uploadedMedia) {
			const path = await fileUpload();
			setSelectedAvatar(path);
			await handleAvatarChange(path);
		}
		await handleAvatarChange(selectedAvatar);
		onClose();
	}

	const handleChange = (event: React.SyntheticEvent, newValue: Coalition|"all") => {
		event as React.MouseEvent<HTMLDivElement>;
		setClickedDialogTab(newValue);
	};

	const handleAvatarChange = async (path: string|undefined) => {
		if (!document || !path) return;
		if (!uploadedMedia)	{
			await updateAvatarInDB(path, user);
		}
		sessionHandler?.setAuthUser({
			session: sessionHandler.authUser.session,
			isLoading: true,
			refresh: true
		});
	}
 
	const toggleDisplay = () => {
		setUploadedMedia(undefined);
		if (display === 'avatarSelect') {
			setDisplay('avatarUpload');
		} else {
			setDisplay('avatarSelect');
		}
	}

	const fileUpload = async (): Promise<string | undefined> => {
		const formData = new FormData();
	
		if (!uploadedMedia) {
			return undefined;
		}
		formData.append('file', uploadedMedia);
		const file = formData.get('file') as File;
		if (file.size > 1000000) {
			enqueueSnackbar("File limit is 1MB", { variant: 'error' });
			setUploadedMedia(undefined);
			return undefined;
		}
		const extension = file.name.split('.').pop();
		if (!extension || !allowedExtensions.includes(extension)) {
			enqueueSnackbar("File must be a png or a jpeg", { variant: 'error' });
			setUploadedMedia(undefined);
			return undefined;
		}
		const path = await tryUpload(formData, enqueueSnackbar);
		return path;
	};

	const handleFileUpload = (file: File | null | undefined) => {
		if (file) {
			setUploadedMedia(file);
		}
	}

	const genImageUpload = ():JSX.Element => {
		return (
			<ImageInput
				onClose={handleFileUpload}
			>
				<div>
					{uploadedMedia ? (
						<div className={styles.uploadedMedia}>
							<img 
								src={URL.createObjectURL(uploadedMedia)}
								alt="avatar"
								style={{width: 200, height: 200, borderRadius: "50%"}}
								className={styles.mediaPreview}
							/>
						</div>
					) : (
						<div style={{marginTop:24}} className={styles.media}>
							<AddIcon style={{fontSize: 48}}/>
							<span>Drag and drop your avatar here</span>
						</div>
					)}
				</div>
			</ImageInput>
		)
	}

	const handleCancel = () => {
		setUploadedMedia(undefined);
		setClickedDialogTab("all");
		props.onClose();
	}

	const dialogButtons = (
		<>
			<Button
				onClick={handleCancel}
				variant='outlined'
			>
				Cancel
			</Button>
			<Button
				onClick={toggleDisplay}
				variant='contained'
			>
				{display === 'avatarSelect' ? 'Upload' : 'Select'}
			</Button>
			<Button
				onClick={handleClose}
				variant='contained'
			>
				Validate
			</Button>
		</>
	)

	return (
		<Dialog
			open={open}
			onClose={handleCancel}
			title="Pick an avatar that suits you"
			buttons={dialogButtons}
			dialogProps={{
				maxWidth: "lg",
			}}
		>
			{display === 'avatarUpload' ? genImageUpload() : (
				<>
					<Tabs
						value={clickedDialogTab}
						onChange={handleChange}
						variant='fullWidth'
						sx={{
							'& .MuiButtonBase-root': {
								fontWeight: "600!important",
								fontFamily: "Lato, Roboto, Arial",
								color: "var(--text)"
							}
						}}
					>
						<Tab value="all" label="all" />
						<Tab value="federation" label="federation" />
						<Tab value="order" label="order" />
						<Tab value="assembly" label="assembly" />
						<Tab value="alliance" label="alliance" />
					</Tabs>
					<ImagePicker
						images={avatars}
						onImageClick={setSelectedAvatar}
						selectedImage={selectedAvatar}
						filter={clickedDialogTab}
						imageBasePath={imageBasePath}
					/>
				</>
			)}
		</Dialog>
	)
}

interface AvatarDialogProps {
	open: boolean,
	onClose: () => void
	user: UserDetails
}

export default AvatarDialog;
