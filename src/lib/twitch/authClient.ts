import { TwitchClient } from '@/lib/twitch/twitchClient'
import {
  accessToken,
  botAccessToken,
  botExpiresIn,
  botObtainmentTimestamp,
  botRefreshToken,
  botUser,
  botUserId,
  clientId,
  clientSecret,
  expiresIn,
  obtainmentTimestamp,
  refreshToken,
  scopes,
  user,
  userId
} from '@/store/auth'
import { chatBadges } from '@/store/chat'
import { RefreshingAuthProvider } from '@twurple/auth'

type AuthType = 'user' | 'bot'

async function createAuthProvider(type: AuthType = 'user'): Promise<RefreshingAuthProvider> {
  const provider = new RefreshingAuthProvider({
    clientId: clientId,
    clientSecret: clientSecret,
    appImpliedScopes: scopes
  })

  provider.onRefresh(async (_, newTokenData) => {
    if (type === 'bot') {
      botAccessToken.value = newTokenData.accessToken
      botRefreshToken.value = newTokenData.refreshToken
      botExpiresIn.value = newTokenData.expiresIn
      botObtainmentTimestamp.value = newTokenData.obtainmentTimestamp
    } else {
      accessToken.value = newTokenData.accessToken
      refreshToken.value = newTokenData.refreshToken
      expiresIn.value = newTokenData.expiresIn
      obtainmentTimestamp.value = newTokenData.obtainmentTimestamp
    }
  })
  return provider
}

//TODO: Refactor the logic so that we don't have to import the authClient in the apiClient here.
// Create and export providers
const authProvider = await createAuthProvider('user')
authProvider
  .addUserForToken(
    {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      obtainmentTimestamp: obtainmentTimestamp.value,
      expiresIn: expiresIn.value
    },
    scopes
  )
  .then(async userData => {
    userId.value = userData

    const { apiClient, getGlobalBadges } = await import('@/lib/twitch/apiClient')
    console.log('userData', userData)
    user.value = (await apiClient?.users.getUserById(userData))!
    const { chatClient } = await import('@/lib/twitch/chatClient')
    chatClient.connect()
    console.log('chatClient', chatClient)
    const globalBadgeSet = await getGlobalBadges()
    chatBadges.value = globalBadgeSet ?? []
    console.log('globalBadgeSet')
  })

const botAuthProvider = await createAuthProvider('bot')
botAuthProvider
  .addUserForToken(
    {
      accessToken: botAccessToken.value,
      refreshToken: botRefreshToken.value,
      obtainmentTimestamp: botObtainmentTimestamp.value,
      expiresIn: botExpiresIn.value
    },
    scopes
  )
  .then(async userData => {
    console.log('botUserId', userData)
    botUserId.value = userData
    const { apiClient } = await import('@/lib/twitch/apiClient')
    botUser.value = (await apiClient?.users.getUserById(userData))!
  })

TwitchClient.initialize(authProvider, botAuthProvider)

export { authProvider, botAuthProvider }
export type { AuthType }
