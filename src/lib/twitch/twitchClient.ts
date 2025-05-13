// twitchClient.ts
import { ApiClient } from '@twurple/api'
import { RefreshingAuthProvider } from '@twurple/auth'

// Export a singleton instance holder
export const TwitchClient = {
  userAuthProvider: null as RefreshingAuthProvider | null,
  botAuthProvider: null as RefreshingAuthProvider | null,
  userApiClient: null as ApiClient | null,
  botApiClient: null as ApiClient | null,

  initialize(userAuthProvider: RefreshingAuthProvider, botAuthProvider: RefreshingAuthProvider) {
    this.userAuthProvider = userAuthProvider
    this.botAuthProvider = botAuthProvider
    this.userApiClient = new ApiClient({ authProvider: userAuthProvider })
    this.botApiClient = new ApiClient({ authProvider: botAuthProvider })
  }
}
