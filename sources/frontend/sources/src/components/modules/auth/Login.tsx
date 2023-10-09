
import React, {useContext, useState, useRef} from 'react';
import LabeledBootstrapInput from '../../common/inputs/LabeledBootstrapInput';
import SocialButton from '../../common/buttons/SocialButton';
import {Link, useLocation} from 'wouter'
import Button from '@mui/material/Button';
import {signIn} from "./services";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { validate2faOauth } from "../../../services/auth";
import PasswordInput from '../../common/inputs/PasswordInput';
import { Session } from './session/session';
import { signInWithProvider } from './providerAuth';

import authStyle from './Auth.module.css';

const Login = () => {
	const [formAssertion, setFormAssertion] = useState<LoginAssertion>({message: undefined, isLoading: false});
	const [transactionCode, setTransactionCode] = useState<TwoFaAssertion>({transactionCode: undefined, isLoading: false});
	const [twoFaCode, setTwoFaCode] = useState<string>('');
	const sessionHandler = useContext(Session);
	const [, navigate] = useLocation();
	const [is2faEnabled, setIs2faEnabled] = useState<boolean>(false);
	const formRef = useRef<HTMLFormElement>(null);
	
	/**
	 * On form submit, send data to the server, and set the response in the state
	 * Redirect to the home page if the response is successful
	 */
	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		setFormAssertion({message: undefined, isLoading: true});
		const response = await signIn(formData);
		if (response?.message === "Invalid 2FA code") {
			return (setIs2faEnabled(true));
		}
		setFormAssertion({message: response?.message, isLoading: false});
		const redirection: string|null = localStorage.getItem("current_page");
		localStorage.removeItem("current_page");
		if (typeof response !== "undefined" && response.success) {
			sessionHandler?.setAuthUser({
				session: undefined,
				isLoading: true,
				refresh: true
			});
			if (redirection !== null) {
				navigate(redirection);
			} else {
				navigate("/");
			}
		}
	}

	const genAlert = () => {
		if (formAssertion.message === undefined) return;
	
		let severity: 'error' | 'info' = 'error';
		if (formAssertion.message === '2FA required') {
			severity = 'info';
		}
	
		return (
			<Alert severity={severity} className={authStyle.alert} data-severity={severity}>
				<AlertTitle>{severity === 'error' ? 'Login failed' : 'Watch out'}</AlertTitle>
				{formAssertion.message}
			</Alert>
		);
	};
	

	const genTitle = () => {
		return (
			<div id={authStyle.title}>
				<h1>Welcome Back</h1>
				<p>Prepare to enter the gravity-defying arena</p>
			</div>
		)
	}

	const handle2faChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.length === 6) {
			const formData = new FormData(formRef.current as HTMLFormElement);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;
			if (email.length === 0 || password.length === 0) return;
			formRef.current?.dispatchEvent(new Event("submit", {cancelable: true, bubbles: true}));
		}
	}

	const handleLastInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			formRef.current?.dispatchEvent(new Event("submit", {cancelable: true, bubbles: true}));
		}
	}

	const genForm = () => {
		return (
			<form onSubmit={handleFormSubmit} ref={formRef}>
				<LabeledBootstrapInput label="Email" inputProps={{
					type: "email",
					placeholder: "john@student.42.fr",
					required: true,
					name: "email"
				}}
				backgroundColor='paper'
				/>
				<PasswordInput label="Password" inputProps={{
					type: "password",
					placeholder: "********",
					required: true,
					name: "password",
					onKeyDown: handleLastInputKeyDown
				}}
				backgroundColor='paper'
				/>
				{is2faEnabled ?
					<LabeledBootstrapInput label="2FA code" inputProps={{
						type: "text",
						placeholder: "XXXXXX",
						required: true,
						name: "authenticateCode",
						onChange: handle2faChange,
					}}
					backgroundColor='paper'
					/>
					: undefined}
				<Button 
					variant="contained" 
					type="submit"
					className={authStyle.customButton}
					sx={{
						fontWeight: 700
					}}
					name="login"
				>
					Login
				</Button>
			</form>
		)
	}

	const genOrSeparator = () => {
		return (
			<div id={authStyle.orSeparator}>
				<hr />
				<span>or</span>
			</div>
		)
	}

	
	const handleProviderConnection = (provider : string) => {
		const redirection: string | null = localStorage.getItem("current_page");
		localStorage.removeItem("current_page");
		signInWithProvider(provider, setFormAssertion, setTransactionCode, sessionHandler, navigate, redirection);
	}

	const gen2faForm = () => {
		if (!transactionCode.transactionCode) return; // Si transactionCode n'existe pas, rien n'est rendu

		return (
			<div>
				<LabeledBootstrapInput
					backgroundColor={transactionCode.transactionCode ? 'paper' : 'default'}
					label="Enter 2FA Code" inputProps={{
						type: "text",
						placeholder: "XXXXXX",
						value: twoFaCode,
						required: true,
						onChange: (e) => setTwoFaCode(e.target.value),
					}}
				/>
				<Button
					variant="contained"
					onClick={handle2faSubmit}
					className={authStyle.customButton}
					sx={{
						fontWeight: 700,
						marginLeft: '15px',
						marginTop: '26px'
					}}
				>
					Verify 2FA
				</Button>
			</div>
		);
	};

	const handle2faSubmit = async () => {
		const userEnteredCode = twoFaCode;
		if (transactionCode.transactionCode) {
			await validate2faOauth(transactionCode.transactionCode, userEnteredCode, setFormAssertion);
		}
	};

	return (
		<div id={authStyle.loginAreaContent}>
			{genAlert()}
			{transactionCode.transactionCode ? gen2faForm() : (
				<>
					{genTitle()}
					{genForm()}
					{genOrSeparator()}
					<div id={authStyle.socialButtons}>
						<SocialButton onClick={() => handleProviderConnection("google")} type="google" />
						<SocialButton onClick={() => handleProviderConnection("forty_two")} type="42 school" />
					</div>
					<Link href='/auth/register' id={authStyle.changeLink}>
						Don&apos;t you have an account? <b>Register here!</b>
					</Link>
				</>
			)}
		</div>
	);
};

export default Login;