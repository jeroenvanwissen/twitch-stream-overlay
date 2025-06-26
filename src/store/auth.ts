import { ref } from 'vue';
import type { HelixUser } from '@twurple/api';
import { useLocalStorage } from '@vueuse/core';

import { TwitchAccessTokenScope } from '@/lib/twitch/authScopes';

// Twitch Client IDs
export const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
export const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;

export const accessToken = useLocalStorage('twitchAccessToken', import.meta.env.VITE_TWITCH_CLIENT_ACCESS_TOKEN);
export const refreshToken = useLocalStorage('twitchRefreshToken', import.meta.env.VITE_TWITCH_CLIENT_REFRESH_TOKEN);
export const expiresIn = useLocalStorage('twitchExpiresIn', 0);
export const obtainmentTimestamp = useLocalStorage('twitchObtainmentTimestamp', 0);
export const userId = ref<string>('');
export const user = ref<HelixUser>();

export const botAccessToken = useLocalStorage('twitchBotAccessToken', import.meta.env.VITE_TWITCH_BOT_ACCESS_TOKEN);
export const botRefreshToken = useLocalStorage('twitchBotRefreshToken', import.meta.env.VITE_TWITCH_BOT_REFRESH_TOKEN);
export const botExpiresIn = useLocalStorage('twitchBotExpiresIn', 0);
export const botObtainmentTimestamp = useLocalStorage('twitchBotObtainmentTimestamp', 0);
export const botUserId = ref<string>('');
export const botUser = ref<HelixUser>();

// Spotify Auth
export const spotifyClientId = useLocalStorage('spotifyClientId', import.meta.env.VITE_SPOTIFY_CLIENT_ID);
export const spotifyClientSecret = useLocalStorage('spotifyClientSecret', import.meta.env.VITE_SPOTIFY_CLIENT_SECRET);
export const spotifyRedirectUri = useLocalStorage('spotifyRedirectUri', import.meta.env.VITE_SPOTIFY_REDIRECT_URI);

export const spotifyAccessToken = useLocalStorage('spotifyAccessToken', import.meta.env.VITE_SPOTIFY_OAUTH_TOKEN);
export const spotifyRefreshToken = useLocalStorage('spotifyRefreshToken', import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN);
export const spotifyExpiresIn = useLocalStorage('spotifyExpiresIn', 0);
export const spotifyExpiresAt = useLocalStorage('spotifyExpiresAt', Date.now());

export const discordClientId = useLocalStorage('discordClientId', import.meta.env.VITE_DISCORD_CLIENT_ID);
export const discordClientSecret = useLocalStorage('discordClientSecret', import.meta.env.VITE_DISCORD_CLIENT_SECRET);
export const discordAccessToken = useLocalStorage('discordAccessToken', import.meta.env.VITE_DISCORD_OAUTH_TOKEN);
export const discordExpiresIn = useLocalStorage('discordExpiresIn', 0);
export const discordExpiresAt = useLocalStorage('discordExpiresAt', Date.now());
export const discordSessionToken = useLocalStorage('discordSessionToken', import.meta.env.VITE_DISCORD_SESSION_TOKEN);

export const spotifyUserId = useLocalStorage('spotifyUserId', import.meta.env.VITE_SPOTIFy_USER_ID);
export const spotifySocketAccessToken = useLocalStorage('spotifySocketAccessToken', import.meta.env.VITE_SPOTIFY_SOCKET_ACCESS_TOKEN);

export const isConnectedToOBS = useLocalStorage('isConnectedToOBS', false);
export const obsAddress = useLocalStorage('obsAddress', 'localhost:4455');
export const obsPassword = useLocalStorage('obsPassword', '');

export const twitchAuthenticated = useLocalStorage('twitchAuthenticated', false);
export const spotifyAuthenticated = useLocalStorage('spotifyAuthenticated', false);

export const scopes: TwitchAccessTokenScope[] = [
	TwitchAccessTokenScope.ChatRead,
	TwitchAccessTokenScope.ChatEdit,
	TwitchAccessTokenScope.ChannelReadSubscriptions,
	TwitchAccessTokenScope.UserReadSubscriptions,
	TwitchAccessTokenScope.ModerationRead,
	TwitchAccessTokenScope.ModeratorManageBannedUsers,
	TwitchAccessTokenScope.ModeratorManageBlockedTerms,
	TwitchAccessTokenScope.ModeratorManageChatMessages,
	TwitchAccessTokenScope.ModeratorManageChatSettings,
	TwitchAccessTokenScope.ModeratorManageShoutouts,
	TwitchAccessTokenScope.ModeratorReadShoutouts,
	TwitchAccessTokenScope.ModeratorManageWarnings,
	TwitchAccessTokenScope.ModeratorReadChatMessages,
	TwitchAccessTokenScope.ModeratorReadChatSettings,
	TwitchAccessTokenScope.ModeratorReadChatters,
	TwitchAccessTokenScope.ModeratorManageAnnouncements,
	TwitchAccessTokenScope.ModeratorReadFollowers,
	TwitchAccessTokenScope.ModeratorReadWarnings,
	TwitchAccessTokenScope.UserReadModeratedChannels,
	TwitchAccessTokenScope.UserWriteChat,
];
