import {useLocalStorage} from "@vueuse/core";
import {ref} from "vue";
import type {HelixUser} from "@twurple/api";
import {TwitchAccessTokenScope} from "@/lib/twitch/authScopes";

export const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
export const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;
export const twitchAuthUrl = import.meta.env.VITE_TWITCH_AUTH_URL;

export const accessToken = useLocalStorage('accessToken', '');
export const refreshToken = useLocalStorage('refreshToken', '');
export const expiresIn = useLocalStorage('expiresIn', 0);
export const obtainmentTimestamp = useLocalStorage('obtainmentTimestamp', 0);
export const userId = ref<string>('');
export const user = ref<HelixUser>();

export const botAccessToken = useLocalStorage('botAccessToken', '');
export const botRefreshToken = useLocalStorage('botRefreshToken', import.meta.env.VITE_TWITCH_BOT_REFRESH_TOKEN);
export const botExpiresIn = useLocalStorage('botExpiresIn', 0);
export const botObtainmentTimestamp = useLocalStorage('botObtainmentTimestamp', 0);
export const botUserId = ref<string>('');
export const botUser = ref<HelixUser>();

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