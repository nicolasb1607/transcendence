const getJWT = ():string|null => {
	return (document.cookie.split('; ').find(row => row.startsWith('jwt_token'))?.split('=')[1] || null);
}

export const fetchPrivateChannel = async (userId:number, recipientId:number):Promise<Chat|null> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/private/${userId}?recipientId=${recipientId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (await response.json());
	} catch (error) {
		return (null);
	}
}
	

export const fetchUserPrivateChannel = async (userId:number):Promise<Chat[]|null> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/privateChannels/${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (await response.json());
	} catch (error) {
		return (null);
	}
}

export const getChannelById = async (channelId:number, confirmedUser = false):Promise<ChannelUpdateResponse> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/${channelId}?confirmedUser=${confirmedUser}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (await response.json());
	} catch (error) {
		// console.error(error);
		return (null);
	}
}

export const getUserChannels = async (userId:number):Promise<ChatDetails[]|null> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/user/${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		const data:ChatDetails[] = await response.json();
		return (data.sort((a, b) => b.memberCount - a.memberCount));
	} catch (error) {
		// console.error(error);
		return (null);
	}
}

export const getChannels = async ():Promise<ChatDetails[]|null> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		const data:ChatDetails[] = await response.json();
		return (data.sort((a, b) => b.memberCount - a.memberCount));
	} catch (error) {
		// console.error(error);
		return (null);
	}
}

export const createChannel = async (channelData:CreateRoomForm, method?:"PUT"|"POST", roomId?:number):Promise<Chat|null> => {
	try {
		if (channelData.type !== "protected") delete channelData.password;
		const roomIdSuffix = (method === "PUT" && roomId) ? `/${roomId}` : "";
		const response = await fetch(process.env.API_URL +`chat/channel${roomIdSuffix}`, {
			method: method || "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			},
			body: JSON.stringify(channelData)
		});
		return (await response.json());
	} catch (error) {
		// console.error(error);
		return (null);
	}
}

export const removeChannel = async (channelId:number):Promise<boolean> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/${channelId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (response.status === 200);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const leaveChannel = async (channelId:number):Promise<boolean|NestError> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/${channelId}/leave`, {
			method: "GET",
			headers: {	
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		if (response.status === 200) return (true);
		if (response.status === 400) return (await response.json() as NestError);
		return (false);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const joinChannel = async (channelId:number, password?:string):Promise<boolean|NestError> => {
	try {
		const passwordQuery = password ? `?password=${encodeURIComponent(password)}` : "";
		console.log({passwordQuery});
		const response = await fetch(process.env.API_URL +`chat/channel/${channelId}/join${passwordQuery}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		if (response.status === 200) return (true);
		if (response.status === 400) return (await response.json() as NestError);
		return (false);
	} catch (error) {
		return (false);
	}
}

export const changeUserRole = async (channelId:number, userId:number, role:UserChannelRole):Promise<boolean> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/action/changeRole/${channelId}?targetUserId=${userId}&role=${role}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (response.status === 200);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const muteUser = async (channelId:number, userId:number):Promise<boolean> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/action/muteUser/${channelId}?targetUserId=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (response.status === 200);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const banUser = async (channelId:number, userId:number):Promise<boolean> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/action/banUser/${channelId}?targetUserId=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (response.status === 200);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const kickUser = async (channelId:number, userId:number):Promise<boolean> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/action/kick/${channelId}?targetUserId=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (response.status === 200);
	} catch (error) {
		// console.error(error);
		return (false);
	}
}

export const getChannelBans = async ():Promise<number[]|null> => {
	try {
		const response = await fetch(process.env.API_URL +`chat/channel/channelBans`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${getJWT()}`
			}
		});
		return (await response.json());
	} catch (error) {
		return (null);
	}
}