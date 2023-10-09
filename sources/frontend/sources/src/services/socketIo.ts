import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getJWT } from '../components/modules/auth/getSessionCookie';

export let chatSocket:Socket;

export const initSocket = () => {
	if (chatSocket?.active) return chatSocket; 
	if (!process.env.SOCKET_URL) throw new Error("SOCKET_URL is not defined");
	const userJWT = getJWT();
	chatSocket = io(process.env.SOCKET_URL, {
		path: "/message",
		auth: {
			token: userJWT
		},
		transports: ['websocket']
	});
	console.log(`Connecting to chatSocket ${chatSocket.io.opts.path}...`);
};

export const disconnectSocket = () => {
	console.log(`Disconnecting from socket ${chatSocket?.io?.opts?.path}...`);
	if (chatSocket) chatSocket.disconnect();
};