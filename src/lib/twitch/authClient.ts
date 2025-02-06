import {RefreshingAuthProvider, StaticAuthProvider} from '@twurple/auth';

import {
    accessToken,
    clientId,
    clientSecret,
    expiresIn,
    obtainmentTimestamp,
    refreshToken,
    scopes, user, userId
} from "@/store/auth";

import {chatBadges} from "@/store/chat";

const tokenData = {
    accessToken: accessToken.value,
    refreshToken: refreshToken.value,
    obtainmentTimestamp: obtainmentTimestamp.value,
    expiresIn: expiresIn.value
};

export const authProvider = new RefreshingAuthProvider(
    {
        clientId: clientId,
        clientSecret: clientSecret,
        appImpliedScopes: scopes,
    }
);

authProvider.addUserForToken(tokenData, scopes)
    .then(async (data) => {
        userId.value = data;

        const {apiClient, getGlobalBadges, getChannelBadges} = await import('@/lib/twitch/apiClient');
        user.value = (await apiClient.users.getUserById(data))!;

        const {chatClient} = await import('@/lib/twitch/chatClient');
        chatClient.connect();

        const globalBadgeSet = await getGlobalBadges(data);
        // const chatBadgeSets = await getChannelBadges(data);

        await import('@/lib/twitch/bot');

        chatBadges.value = globalBadgeSet;
    });

authProvider.onRefresh(async (id, newTokenData) => {
    accessToken.value = newTokenData.accessToken;
    refreshToken.value = newTokenData.refreshToken;
    expiresIn.value = newTokenData.expiresIn;
    obtainmentTimestamp.value = newTokenData.obtainmentTimestamp;
});


export const staticAuthProvider = new StaticAuthProvider(clientId, accessToken.value, scopes);

