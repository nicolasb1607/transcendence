import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getJWT } from '../components/modules/auth/getSessionCookie';

export let userSocket:Socket;

export const initSocket = () => {
	if (userSocket?.active) return userSocket; 
	if (!process.env.SOCKET_URL) throw new Error("SOCKET_URL is not defined");
	const userJWT = getJWT();
	if (!userJWT) return ;
	userSocket = io(process.env.SOCKET_URL, {
		path: "/users",
		auth: {
			token: userJWT
		},
		transports: ['websocket']
	});
	console.log(`Connecting to socket ${userSocket.io.opts.path}...`);
};

export const disconnectSocket = () => {
	console.log(`Disconnecting from socket ${userSocket?.io?.opts?.path}...`);
	if (userSocket) userSocket.disconnect();
};