export const signInWithProvider = async (provider:string,
	setFormAssertion: React.Dispatch<React.SetStateAction<LoginAssertion>>,
	setTransactionCode: React.Dispatch<React.SetStateAction<TwoFaAssertion>>, 
	sessionHandler: SessionContext | undefined,
	navigate: (path: string) => void, redirection : string|null
) => {
	try {
		if (!process.env.API_URL) { throw new Error("API_URL undefined") }
		const apiUrl = process.env.API_URL;
		let backendUrl;
	
		if (provider === "google") {
			backendUrl = process.env.API_URL + "api/auth/login/google";
		} else {
			backendUrl = process.env.API_URL + "api/auth/login/42";
		}
	
		window.addEventListener("message", (event) => {
			if (event.origin !== apiUrl.replace(/\/$/, '')) {
				return ;
			}
			if (event.data === "auth-complete") {
				if (redirection !== null) {
					sessionHandler?.setAuthUser({
						session: undefined,
						isLoading: true,
						refresh: true
					});
					navigate(redirection);
				} else {
					if (process.env.SITE_URL)
						window.location.href = process.env.SITE_URL;
				}
			}
			else { // if 2fa required
				if (!event?.data || !event?.data?.includes(',')) return ;
				const [message, code] = event.data.split(',');
				setFormAssertion({ message, isLoading: false});
				setTransactionCode({transactionCode: code, isLoading: false})
			}
		}, false);
		window.open(backendUrl, '_blank', `width=800,height=600,left=400,top=200`);
	} catch (error) {
		console.log("Unable to fetch");
	}
}