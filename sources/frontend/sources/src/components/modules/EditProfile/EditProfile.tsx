import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import LabeledBootstrapInput from '../../common/inputs/LabeledBootstrapInput';
import { updateInfo } from '../../../services/updateInfo';
import ThemePicker from './ThemePicker';
import { Session } from '../../modules/auth/session/session';
import { activateTwoFA } from '../../../services/auth';
import { useSession } from '../../../hooks/useSession';
import { getUser2faStatus } from '../../../services/user';
import { Helmet } from 'react-helmet';
import TwoFADialog from './TwoFADialog/TwoFADialog';
import TwoFACancelDialog from './TwoFADialog/TwoFACancelDialog';
import { inputSx, lgInputSx } from './EditProfileStyle';
import { assertEditProfileForm } from './assertForm';
import { useSnackbar } from 'notistack';

import styles from "./EditProfile.module.css"

const EditProfile = () => {
	const [error, setError] = useState<editProfilFormError[]|undefined>(undefined);
	const [is2FAOpen, setIs2FAOpen] = useState(false);
	const [is2FAActivated, setIs2FAActivated] = useState(false);
	const [dataUrl, setDataUrl] = useState<string|undefined>();
	const [session] = useSession();
	const sessionHandler = useContext(Session);
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {

		const activeTwoFA = async () => {
			const response = await activateTwoFA();
			if (response?.message === "error in 2FA activation") return ("An unexpected error occurs");//todo replace this by a correct error handling
			setDataUrl(response?.message);
		}
		if (is2FAOpen) activeTwoFA();
	}, [is2FAOpen]);

	useEffect(() => {

		const get2faStatus = async () => {
			const ret = await getUser2faStatus();
			if (ret) {
				setIs2FAActivated(ret);
			}
		}
		get2faStatus();
	}, []);

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const formAssertion = assertEditProfileForm(formData);
		if (formAssertion) {
			setError(formAssertion);
			return;
		}
		const response = await updateInfo(session?.ID as number, formData);
		if (response && "statusCode" in response) {
			if (response.error === "Conflict") 
				enqueueSnackbar(response.message, { variant: 'error' });
			else
				enqueueSnackbar("Error while attempting to update profile informations", { variant: 'error' });
		}
		else enqueueSnackbar('Profile informations successfully updated', { variant: 'success' });
		sessionHandler?.setAuthUser({
			session: sessionHandler.authUser.session,
			isLoading: true,
			refresh: true
		});
	}

	const getFormError = (inputName: editProfilInputs) => {
		if (!error) return {};
		const inputError = error.find((e) => e.wrongField === inputName);
		return ({
			error: Boolean(inputError),
			formHelper: inputError?.error
		} || {});
	}

	const accountForm = () => {
		if (!session) return ;
		return (
			<>
				<input type="string" style={{display: "none"}} defaultValue="" id="userAvatar" name="userAvatar" />
				<div className={styles.accountForm}>
					<div className={styles.formRow}>
						<LabeledBootstrapInput label="First name" inputProps={{
							defaultValue: session.firstName,
							type: "text",
							name: "firstName",
							...inputSx,
						}}
						{...getFormError("firstName")}
						/>
						<LabeledBootstrapInput label="Last name" inputProps={{
							defaultValue: session.lastName,
							type: "text",
							name: "lastName",
							...inputSx,
						}}
						{...getFormError("lastName")}
						/>
					</div>
					<LabeledBootstrapInput label="Mail Address" inputProps={{
						defaultValue: session.email,
						type: "email",
						required: true,
						name: "email",
						...inputSx,
						...lgInputSx,
					}}
					{...getFormError("email")}
					/>
					<LabeledBootstrapInput label="Username" inputProps={{
						defaultValue: session.login,
						type: "text",
						required: true,
						name: "username",
						...inputSx,
						...lgInputSx,
					}}
					{...getFormError("username")}
					/>
					<LabeledBootstrapInput label="Description" inputProps={{
						defaultValue: session.description,
						type: "text",
						name: "description",
						...inputSx,
						...lgInputSx,
						inputProps:{
							maxLength:"250"
						},
						multiline: true,
						rows: 4,
					}}
					{...getFormError("description")}
					/>
				</div>
			</>
		);
	}

	const auth2FAcheck = (enable: boolean): JSX.Element => {
		return (
			<div className={styles.auth2FAcheck}>
				<b>{enable ? "Two-factor authentication already enable " : "Two-factor authentication is not enable yet"}</b>
				<p>Two-factor authentication provides enhanced account security by requiring more than just a password for signing in.</p>
				<div className={styles.button2FAContainer}>
					<div className={styles.buttonContainer}>
						<Button onClick={() => setIs2FAOpen(true)} variant="contained">
							{is2FAActivated ?
								"Disable two-factor authentication (2FA)"
								:	"Enable two-factor authentication (2FA)"
							}
						</Button>
						{is2FAActivated ?
							<TwoFACancelDialog
								open={is2FAOpen}
								onClose={() => setIs2FAOpen(false)}
								update={setIs2FAActivated}
							/>
							:
							<TwoFADialog
								open={is2FAOpen}
								onClose={() => setIs2FAOpen(false)}
								data={dataUrl}
								update={setIs2FAActivated}
							/>
						}
					</div>
				</div>
			</div>
		);
	}

	const genBlockTitle = (title:string) => (
		<div className={styles.blockTitle}>
			<h1>{title}</h1>
			<hr/>
		</div>
	)

	return (
		<div  className={styles.mainContent}>
			<Helmet title='Edit My Profile' />
			<div className={styles.block}>
				{genBlockTitle("Appearance")}
				<h2>Theme</h2>
				<ThemePicker/>
			</div>
			<form onSubmit={handleFormSubmit}>
				<div className={styles.block}>
					{genBlockTitle("Account")}
					{accountForm()}
				</div>
				<div className={styles.block}>
					{genBlockTitle("Two-factor authentication")}
					{auth2FAcheck(is2FAActivated)}
				</div>
				<div className={styles.buttonSaveContainer}>
					<Button variant="contained" type='submit'>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default EditProfile;


