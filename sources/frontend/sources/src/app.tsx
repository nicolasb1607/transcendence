import React from 'react';


import Routes from './Routes';
import Layout from './components/layouts/Layout';
import ThemeProvider from './components/modules/ThemePicker/theme';
import Theme from './styles/theme';
import SessionProvider from './components/modules/auth/session/session';
import OnlinePlayersProvider from './context/onlinePlayers';
import ChannelContextProvider from './components/layouts/tchat/currentChannel.context';
import {SnackbarProvider} from "notistack";

const App = () => {
	return (
		<ThemeProvider>
			<Theme>
				<SnackbarProvider maxSnack={3}>
					<SessionProvider>
						<ChannelContextProvider>
							<OnlinePlayersProvider>
								<Layout>
									<Routes/>
								</Layout>
							</OnlinePlayersProvider>
						</ChannelContextProvider>
					</SessionProvider>
				</SnackbarProvider>
			</Theme>
		</ThemeProvider>
	);
};
export default App;