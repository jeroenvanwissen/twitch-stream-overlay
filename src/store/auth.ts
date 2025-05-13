import { TwitchAccessTokenScope } from '@/lib/twitch/authScopes'
import type { HelixUser } from '@twurple/api'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

export const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
export const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET
export const twitchAuthUrl = import.meta.env.VITE_TWITCH_AUTH_URL

export const accessToken = useLocalStorage('accessToken', import.meta.env.VITE_TWITCH_CLIENT_ACCESS_TOKEN)
export const refreshToken = useLocalStorage('refreshToken', import.meta.env.VITE_TWITCH_CLIENT_REFRESH_TOKEN)
export const expiresIn = useLocalStorage('expiresIn', 0)
export const obtainmentTimestamp = useLocalStorage('obtainmentTimestamp', 0)
export const userId = ref<string>('')
export const user = ref<HelixUser>()

export const botAccessToken = useLocalStorage('botAccessToken', import.meta.env.VITE_TWITCH_BOT_ACCESS_TOKEN)
export const botRefreshToken = useLocalStorage('botRefreshToken', import.meta.env.VITE_TWITCH_BOT_REFRESH_TOKEN)
export const botExpiresIn = useLocalStorage('botExpiresIn', 0)
export const botObtainmentTimestamp = useLocalStorage('botObtainmentTimestamp', 0)
export const botUserId = ref<string>('')
export const botUser = ref<HelixUser>()

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
  TwitchAccessTokenScope.UserWriteChat
]
