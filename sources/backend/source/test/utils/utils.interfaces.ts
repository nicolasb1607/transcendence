export interface HttpError {
	statusCode:	number;
	message:	string;
	error:		string;
}

export interface Message {
	message: string;
}

export interface ThrowObject {
	response: {
		error: string;
		statusCode: number;
		message: string;
	}
	status: number;
	options: object;
	message: string;
	name: string;
}