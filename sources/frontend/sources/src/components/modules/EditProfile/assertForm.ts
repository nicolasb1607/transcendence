const assertLength = (value: string, key: string, min: number, max: number):void => {
	if (!value || value.length === 0) return ;
	if (value.length < min) throw new Error(`${key} is too short`);
	if (value.length > max) throw new Error(`${key} is too long`);
}

const assertName = (name: string, key:string):void => {
	assertLength(name, key, 2, 30);
}

const assertLogin = (login: string):void => {
	assertLength(login, 'login', 3, 20);
	if (!login.match(/^\S*$/)) throw new Error('login must not contain spaces');
}

const assertEmail = (email: string):void => {
	assertLength(email, 'email', 3, 255);
}

const assertDescription = (description: string):void => {
	assertLength(description, 'description', 0, 100);
}

const inputToAssert = {
	username: assertLogin,
	email: assertEmail,
	firstName: (name: string) => assertName(name, 'firstName'),
	lastName: (name: string) => assertName(name, 'lastName'),
	description: assertDescription
}

export const assertEditProfileForm = (
	form: FormData
): editProfilFormError[] | null => {
	const formInputs:editProfilInputs[] = ['username', 'email', 'firstName',
		'lastName', 'description']
	const formData = Object.fromEntries(form.entries());
	const errors:editProfilFormError[] = [];

	for (const input of formInputs) {
		if (!formData[input]) continue;
		
		try {
			inputToAssert[input](formData[input] as string);
		} catch (e) {
			if (!(e instanceof Error)) continue;
			errors.push({
				error: e.message,
				wrongField: input as editProfilInputs
			})
		}
	}
	return (errors.length > 0 ? errors : null);
}