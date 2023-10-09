import React, { createContext, useState } from 'react';

export const ChannelContext = createContext<ChannelContext>({
	channelId: 0,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setChannelId: () => {}
})

const ChannelContextProvider = (props:ChannelContextProps) => {
	const [channelId, setChannelId] = useState(0);

	return (
		<ChannelContext.Provider value={{ channelId, setChannelId }}>
			{props.children}
		</ChannelContext.Provider>
	)
}

interface ChannelContextProps {
	children: React.ReactNode;
}

export default ChannelContextProvider;