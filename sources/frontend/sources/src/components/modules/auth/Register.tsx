import React, {useContext, useRef, useState} from 'react';
import {register} from "./services";
import LabeledBootstrapInput from '../../common/inputs/LabeledBootstrapInput';
import Button from '@mui/material/Button';
import SocialButton from '../../common/buttons/SocialButton';
import {Link, useLocation} from 'wouter'
import { validate2faOauth } from "../../../services/auth";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import PasswordInput from '../../common/inputs/PasswordInput';
import authStyle from './Auth.module.css';
import { Session } from './session/session';
import { signInWithProvider } from './providerAuth';
import { enqueueSnackbar } from 'notistack';

const Register = () => {
	const [formAssertionLogin, setFormAssertionLogin] = useState<LoginAssertion>({message: undefined, isLoading: false});
	const [transactionCode, setTransactionCode] = useState<TwoFaAssertion>({transactionCode: undefined, isLoading: false});
	const [twoFaCode, setTwoFaCode] = useState<string>('');
	const [formAssertion, setFormAssertion] = useState<RegisterAssertion>({data: undefined, isLoading: false});
	const sessionHandler = useContext(Session);
	const [, navigate] = useLocation();
	const formRef = useRef<HTMLFormElement>(null);

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		setFormAssertion({data: undefined, isLoading: true});
		const response = await register(formData);
		if (response && "message" in response) {
			enqueueSnackbar(response.message, {variant: "error"});
		}
		setFormAssertion({data: response, isLoading: false});
		const redirection: string|null = localStorage.getItem("current_page");
		localStorage.removeItem("current_page");
		if (typeof response !== "undefined" && response.success) {
			sessionHandler?.setAuthUser({
				session: sessionHandler.authUser.session,
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

	const getInputError = (inputName: string) => {
		if (formAssertion.data === undefined) return undefined;
		const error = formAssertion.data.errors?.find((error) => error.name === inputName);
		return error?.error;
	}

	const genTitle = () => {
		return (
			<div id={authStyle.title}>
				<h1>Register</h1>
				<p>Join the ranks of intergalactic challengers as you embark on your quest to conquer the arena of spatial pong.</p>
			</div>
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

	const handleLastInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			formRef.current?.dispatchEvent(new Event("submit", {cancelable: true, bubbles: true}));
		}
	}

	const genForm = () => {
		return (
			<form onSubmit={handleFormSubmit} style={{gap:16}} ref={formRef}>
				<LabeledBootstrapInput label="Username" inputProps={{
					type: "text",
					placeholder: "John Doe",
					required: true,
					name: "username",
					autoComplete: "username"
				}}
				formHelper={getInputError("username")}
				backgroundColor='paper'
				/>
				<LabeledBootstrapInput label="Email" inputProps={{
					type: "email",
					placeholder: "john@student.42.fr",
					required: true,
					name: "email"
				}}
				formHelper={getInputError("email")}
				backgroundColor='paper'
				/>
				<PasswordInput label="Password" inputProps={{
					type: "password",
					placeholder: "********",
					required: true,
					name: "password"
				}}
				formHelper={getInputError("password")}
				backgroundColor='paper'
				/>
				<PasswordInput label="Confirm password" inputProps={{
					type: "password",
					placeholder: "********",
					required: true,
					name: "passwordConfirm",
					autoComplete: "new-password",
					onKeyDown: handleLastInputKeyDown
				}}
				formHelper={getInputError("passwordConfirm")}
				backgroundColor='paper'
				/>
				<Button 
					variant="contained" 
					type="submit"
					className={authStyle.customButton}
					sx={{
						fontWeight: 700
					}}
				>
					Register
				</Button>
			</form>
		)
	}


	const genAlert = () => {
		if (formAssertionLogin.message === undefined) return;
	
		let severity: 'error' | 'info' = 'error';
		if (formAssertionLogin.message === '2FA required') {
			severity = 'info';
		}
	
		return (
			<Alert severity={severity} className={authStyle.alert}>
				<AlertTitle>{severity === 'error' ? 'Login failed' : 'Attention'}</AlertTitle>
				{formAssertionLogin.message}
			</Alert>
		);
	};
	

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
	const handleProviderConnection = (provider : string) => {
		const redirection: string|null = localStorage.getItem("current_page");
		localStorage.removeItem("current_page");
		signInWithProvider(provider, setFormAssertionLogin, setTransactionCode, sessionHandler, navigate, redirection);
	}

	const handle2faSubmit = async () => {
		const userEnteredCode = twoFaCode;	
		if (transactionCode.transactionCode) {
			await validate2faOauth(transactionCode.transactionCode, userEnteredCode, setFormAssertionLogin);
		}
	};
	
	return (
		<div id={authStyle.loginAreaContent} style={{ gap: 24 }}>
			{genAlert()}
			{transactionCode.transactionCode ? (
				gen2faForm()
			) : (
				<>
					{genTitle()}
					<div id={authStyle.socialButtonsSm}>
						<SocialButton onClick={() => handleProviderConnection("google")} type="google" size="small" />
						<SocialButton onClick={() => handleProviderConnection("forty_two")} type="42 school" size="small" />
					</div>
					{genOrSeparator()}
					{genForm()}
					<Link href="/auth/login" id={authStyle.changeLink}>
						Already have an account? <b>Login here!</b>
					</Link>
				</>
			)}
		</div>
	);
};

export default Register;