import type { HelixUser } from '@twurple/api';
import { useLocalStorage } from '@vueuse/core';

import { TwitchAccessTokenScope } from '@/lib/twitch/authScopes';

// Twitch Client IDs
export const clientId = useLocalStorage('twitchClientId', import.meta.env.VITE_TWITCH_CLIENT_ID);
export const clientSecret = useLocalStorage('twitchClientSecret', import.meta.env.VITE_TWITCH_CLIENT_SECRET);

export const accessToken = useLocalStorage('twitchAccessToken', import.meta.env.VITE_TWITCH_CLIENT_ACCESS_TOKEN);
export const refreshToken = useLocalStorage('twitchRefreshToken', import.meta.env.VITE_TWITCH_CLIENT_REFRESH_TOKEN);
export const expiresIn = useLocalStorage('twitchExpiresIn', 0);
export const obtainmentTimestamp = useLocalStorage('twitchObtainmentTimestamp', 0);
export const userId = useLocalStorage<string>('userId', '');
export const user = useLocalStorage<Partial<HelixUser>>('user', <Partial<HelixUser>>{});

export const botAccessToken = useLocalStorage('twitchBotAccessToken', import.meta.env.VITE_TWITCH_BOT_ACCESS_TOKEN);
export const botRefreshToken = useLocalStorage('twitchBotRefreshToken', import.meta.env.VITE_TWITCH_BOT_REFRESH_TOKEN);
export const botExpiresIn = useLocalStorage('twitchBotExpiresIn', 0);
export const botObtainmentTimestamp = useLocalStorage('twitchBotObtainmentTimestamp', 0);
export const botUserId = useLocalStorage<string>('botUserId', '');
export const botUser = useLocalStorage<Partial<HelixUser>>('botUser', <Partial<HelixUser>>{});

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
	TwitchAccessTokenScope.AnalyticsReadExtensions,
	TwitchAccessTokenScope.AnalyticsReadGames,
	TwitchAccessTokenScope.BitsRead,
	TwitchAccessTokenScope.ChannelBot,
	TwitchAccessTokenScope.ChannelEditCommercial,
	TwitchAccessTokenScope.ChannelManageAds,
	TwitchAccessTokenScope.ChannelManageBroadcast,
	TwitchAccessTokenScope.ChannelManageExtensions,
	TwitchAccessTokenScope.ChannelManageGuestStar,
	TwitchAccessTokenScope.ChannelManageModerators,
	TwitchAccessTokenScope.ChannelManagePolls,
	TwitchAccessTokenScope.ChannelManagePredictions,
	TwitchAccessTokenScope.ChannelManageRaids,
	TwitchAccessTokenScope.ChannelManageRedemptions,
	TwitchAccessTokenScope.ChannelManageSchedule,
	TwitchAccessTokenScope.ChannelManageVideos,
	TwitchAccessTokenScope.ChannelManageVips,
	TwitchAccessTokenScope.ChannelReadAds,
	TwitchAccessTokenScope.ChannelReadCharity,
	TwitchAccessTokenScope.ChannelReadEditors,
	TwitchAccessTokenScope.ChannelReadGoals,
	TwitchAccessTokenScope.ChannelReadGuestStar,
	TwitchAccessTokenScope.ChannelReadHypeTrain,
	TwitchAccessTokenScope.ChannelReadPolls,
	TwitchAccessTokenScope.ChannelReadPredictions,
	TwitchAccessTokenScope.ChannelReadRedemptions,
	TwitchAccessTokenScope.ChannelReadStreamKey,
	TwitchAccessTokenScope.ChannelReadSubscriptions,
	TwitchAccessTokenScope.ChannelReadVips,
	TwitchAccessTokenScope.ChatEdit,
	TwitchAccessTokenScope.ChatRead,
	TwitchAccessTokenScope.ClipsEdit,
	TwitchAccessTokenScope.ModerationRead,
	TwitchAccessTokenScope.ModeratorManageAnnouncements,
	TwitchAccessTokenScope.ModeratorManageAutomod,
	TwitchAccessTokenScope.ModeratorManageAutomodSettings,
	TwitchAccessTokenScope.ModeratorManageBannedUsers,
	TwitchAccessTokenScope.ModeratorManageBlockedTerms,
	TwitchAccessTokenScope.ModeratorManageChatMessages,
	TwitchAccessTokenScope.ModeratorManageChatSettings,
	TwitchAccessTokenScope.ModeratorManageGuestStar,
	TwitchAccessTokenScope.ModeratorManageShieldMode,
	TwitchAccessTokenScope.ModeratorManageShoutouts,
	TwitchAccessTokenScope.ModeratorManageUnbanRequests,
	TwitchAccessTokenScope.ModeratorManageWarnings,
	TwitchAccessTokenScope.ModeratorReadAutomodSettings,
	TwitchAccessTokenScope.ModeratorReadBannedUsers,
	TwitchAccessTokenScope.ModeratorReadBlockedTerms,
	TwitchAccessTokenScope.ModeratorReadChatMessages,
	TwitchAccessTokenScope.ModeratorReadChatSettings,
	TwitchAccessTokenScope.ModeratorReadChatters,
	TwitchAccessTokenScope.ModeratorReadFollowers,
	TwitchAccessTokenScope.ModeratorReadGuestStar,
	TwitchAccessTokenScope.ModeratorReadModerators,
	TwitchAccessTokenScope.ModeratorReadShieldMode,
	TwitchAccessTokenScope.ModeratorReadShoutouts,
	TwitchAccessTokenScope.ModeratorReadSuspiciousUsers,
	TwitchAccessTokenScope.ModeratorReadUnbanRequests,
	TwitchAccessTokenScope.ModeratorReadVips,
	TwitchAccessTokenScope.ModeratorReadWarnings,
	TwitchAccessTokenScope.UserBot,
	TwitchAccessTokenScope.UserEdit,
	TwitchAccessTokenScope.UserEditBroadcast,
	TwitchAccessTokenScope.UserManageBlockedUsers,
	TwitchAccessTokenScope.UserManageChatColor,
	TwitchAccessTokenScope.UserManageWhispers,
	TwitchAccessTokenScope.UserReadBlockedUsers,
	TwitchAccessTokenScope.UserReadBroadcast,
	TwitchAccessTokenScope.UserReadChat,
	TwitchAccessTokenScope.UserReadEmail,
	TwitchAccessTokenScope.UserReadEmotes,
	TwitchAccessTokenScope.UserReadFollows,
	TwitchAccessTokenScope.UserReadModeratedChannels,
	TwitchAccessTokenScope.UserReadSubscriptions,
	TwitchAccessTokenScope.UserReadWhispers,
];
