import { RefreshingAuthProvider } from '@twurple/auth';

import { TwitchClient } from '@/lib/twitch/twitchClient';
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
	userId,
} from '@/store/auth';
import { chatBadges } from '@/store/chat';

type AuthType = 'user' | 'bot';

async function createAuthProvider(type: AuthType = 'user'): Promise<RefreshingAuthProvider> {
	const provider = new RefreshingAuthProvider({
		// these need to be refs but the provider expects them to be strings
		clientId: clientId.value as unknown as string,
		clientSecret: clientSecret.value as unknown as string,
		appImpliedScopes: scopes,
	});

	provider.onRefresh(async (_, newTokenData) => {
		if (type === 'bot') {
			botAccessToken.value = newTokenData.accessToken;
			botRefreshToken.value = newTokenData.refreshToken;
			botExpiresIn.value = newTokenData.expiresIn;
			botObtainmentTimestamp.value = newTokenData.obtainmentTimestamp;
		}
		else {
			accessToken.value = newTokenData.accessToken;
			refreshToken.value = newTokenData.refreshToken;
			expiresIn.value = newTokenData.expiresIn;
			obtainmentTimestamp.value = newTokenData.obtainmentTimestamp;
		}
	});
	return provider;
}

// TODO: Refactor the logic so that we don't have to import the authClient in the apiClient here.
// Create and export providers
const authProvider = await createAuthProvider('user');
authProvider
	.addUserForToken(
		{
			accessToken: accessToken.value,
			refreshToken: refreshToken.value,
			obtainmentTimestamp: obtainmentTimestamp.value,
			expiresIn: expiresIn.value,
		},
		scopes,
	)
	.then(async (userData) => {
		userId.value = userData;
		console.log('Creating user client for', userData);

		const { apiClient, getGlobalBadges } = await import('@/lib/twitch/apiClient');
		const u = await apiClient?.users.getUserById(userData);
		user.value = {
			id: u!.id!,
			name: u!.name!,
			displayName: u!.displayName!,
			description: u!.description!,
			profilePictureUrl: u!.profilePictureUrl!,
			offlinePlaceholderUrl: u!.offlinePlaceholderUrl!,
			broadcasterType: u!.broadcasterType!,
			type: u!.type!,
			creationDate: u!.creationDate!,
		};

		const { chatClient } = await import('@/lib/twitch/chatClient');
		chatClient.connect();
		const globalBadgeSet = await getGlobalBadges();
		chatBadges.value = globalBadgeSet ?? [];
	});

const botAuthProvider = await createAuthProvider('bot');
botAuthProvider
	.addUserForToken(
		{
			accessToken: botAccessToken.value,
			refreshToken: botRefreshToken.value,
			obtainmentTimestamp: botObtainmentTimestamp.value,
			expiresIn: botExpiresIn.value,
		},
		scopes,
	)
	.then(async (userData) => {
		botUserId.value = userData;
		botAuthProvider.addIntentsToUser(userData, ['chat']);

		console.log('Creating user client for', userData);

		const { apiClient } = await import('@/lib/twitch/apiClient');
		const u = await apiClient?.users.getUserById(userData);
		botUser.value = {
			id: u!.id!,
			name: u!.name!,
			displayName: u!.displayName!,
			description: u!.description!,
			profilePictureUrl: u!.profilePictureUrl!,
			offlinePlaceholderUrl: u!.offlinePlaceholderUrl!,
			broadcasterType: u!.broadcasterType!,
			type: u!.type!,
			creationDate: u!.creationDate!,
		};

		const { setupEventSub } = await import('@/lib/twitch/bot');
		await setupEventSub();
	});

TwitchClient.initialize(authProvider, botAuthProvider);

export { authProvider, botAuthProvider };
export type { AuthType };
