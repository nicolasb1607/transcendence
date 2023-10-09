import { useState, useEffect, useContext } from "react";
import { useSession } from "./useSession";
import { initSocket, disconnectSocket, chatSocket } from "../services/socketIo";
import { useSnackbar } from "notistack";
import { ChannelContext } from "../components/layouts/tchat/currentChannel.context";

const useChat = (props?:useChatProps) => {
	const [tchatData, setTchatData] = useState<Chat | null>(null);
	const [session] = useSession();
	const { enqueueSnackbar } = useSnackbar();
	const channelHandler = useContext(ChannelContext);
	const defaultChannelId = props?.channelId || 1;

	const onMessage = (message: Message) => {
		console.log("onMessage", message)
		setTchatData((prevData) => {
			if (!prevData) return null;
			return {
				...prevData,
				messages: [...prevData.messages, message],
			};
		});
	}

 	const onException = (exception: NestError) => {
		if (!props?.onError) return;
		props.onError(exception);
		if (exception.error === "ForbiddenChannel"){
			channelHandler.setChannelId(0);
		}
		if (exception.statusCode === 403) {
			enqueueSnackbar(exception.message, { variant: 'error' });
		}
	}

	useEffect(() => {
		if (!chatSocket) return;

		const onKick = (kick:{channelId:number, userId:number, ban?:boolean}) => {
			if (kick.userId === session?.ID && tchatData?.ID === kick.channelId) {
				enqueueSnackbar(`You have been ${kick?.ban ? 'banned' : 'kicked'} from this channel`, { variant: 'error' });
				setTchatData(null);
				channelHandler.setChannelId(0);
				//chatSocket.emit("join", { channelId: 1 });
			}
		}

		chatSocket.on("kick", onKick);

		return () => {
			chatSocket.off("kick", onKick);
		}
	}, [tchatData]);

	useEffect(() => {

		const onChannelJoin = (channel: Chat) => {
			console.log("joined channel " + channel.ID);
			if (!channel || !channel?.messages) return;
			setTchatData(channel);
		}

		const onRefreshChannel = (channel:Chat) => {
			console.log("Refreshing channel")
			if (!channel || !channel?.messages) return;
			setTchatData(channel);
		}

		const leaveChannel = () => {
			if (!tchatData) return;
			console.log("Leaving channel")
			chatSocket.emit("leave", {
				channelId: tchatData.ID
			});
		}

		initSocket();
		chatSocket.emit("join", { channelId:defaultChannelId });
		chatSocket.on("channel", onChannelJoin);
		chatSocket.on("message", onMessage);
		chatSocket.on("exception", onException);
		
		chatSocket.on("refreshChannel", onRefreshChannel);

		return () => {
			leaveChannel();
			disconnectSocket();
			chatSocket.off("channel", onChannelJoin);
			chatSocket.off("message", onMessage);
			chatSocket.off("exception", onException);
			chatSocket.off("refreshChannel", onRefreshChannel);
		}
	}, [defaultChannelId]);

	const sendMessage = (message: string) => {
		if (!message || message.length == 0 || !tchatData) return;
		chatSocket.emit("message", {
			channelId: tchatData.ID,
			content: message
		});
	};

	return ({
		data: tchatData,
		sendMessage
	})
}

interface useChatProps {
	channelId?: number;
	onError?: (exception: NestError) => void;
}

export default useChat;