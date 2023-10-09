import { fetchPrivateChannel } from "../../../services/chat";

export const launchConversation = async (
	event:userPrivateClickEvent,
	channelHandler:ChannelContext,
	userId:number
) => {
	if (event.type === "channelId") {
		channelHandler.setChannelId(event.value)
	} else {
		const newConversation = await fetchPrivateChannel(userId, event.value);
		if (!newConversation) return;
		channelHandler.setChannelId(newConversation.ID);
	}
}