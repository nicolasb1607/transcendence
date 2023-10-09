export const validateRoomName = (roomName:string) => {
	if (roomName.length < 3) throw new Error("Room name must be at least 3 characters long");
	if (roomName.length > 18) throw new Error("Room name must be less than 18 characters long");
	if (!/^[a-zA-Z-_\s\d]+$/.test(roomName)) throw new Error("Room name must only contain letters, dashes and underscores");
}

export const validateRoomPassword = (roomPassword:string) => {
	if (roomPassword === "") throw new Error("Password cannot be empty on protected room");
	if (roomPassword.length < 2) throw new Error("Password must be at least 2 characters long");
	if (roomPassword.length > 32) throw new Error("Password must be less than 32 characters long");
}

export const validateRoomPasswordConfirm = (roomPassword:string, roomPasswordConfirm:string) => {
	if (roomPassword !== roomPasswordConfirm) throw new Error("Passwords do not match");
}

export const validateCreateRoomForm = (CreateRoomForm:Partial<CreateRoomForm>, currentStep:number):ValidateCreateRoomFormResponse => {
	const { name, type, password, passwordConfirmation, image, participants } = CreateRoomForm;
	
	console.log({name, type, password, passwordConfirmation, image, participants})
	try {
		validateRoomName(name?.trim() as string);
		if (type === 'protected'){
			validateRoomPassword(encodeURIComponent(password as string));
			validateRoomPasswordConfirm(encodeURIComponent(password as string), encodeURIComponent(passwordConfirmation as string));
		}
	} catch (error: unknown) {
		return ({
			valid: false,
			error: (error as Error).message,
			failingStep: 0,
		})
	}
	if (currentStep === 0) return ({valid: true});
	if (typeof image === "undefined" || image?.length < 2) {
		return ({
			valid: false,
			error: "You must select an image for your room",
			failingStep: 1,
		})
	}
	if (currentStep === 1) return ({valid: true});
	if (typeof participants === "undefined" || participants?.length < 1) {
		return ({
			valid: false,
			error: "You must select at least one participant for your room",
			failingStep: 2,
		})
	}
	return ({
		valid: true,
	})
}