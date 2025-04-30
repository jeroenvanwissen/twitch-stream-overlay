import { userId } from "@/store/auth";

import { TwitchClient } from "./twitchClient";

export const apiClient = TwitchClient.userApiClient;

export const getUserIdFromName = async (name: string) => {
  return await apiClient?.users.getUserByName(name).then((user) => {
    return user?.id;
  });
};

// location.reload();
export const getChannelInformation = async (broadcaster: string) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.channels.getChannelInfoById(broadcaster);
  });
};
export const getChannelFollowers = async (
  broadcaster: string,
  user: string,
) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.channels.getChannelFollowers(broadcaster, user);
  });
};

export const getGlobalBadges = async () => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.chat.getGlobalBadges();
  });
};

export const getChannelBadges = async (broadcaster: string, userId: string) => {
  const broadcasterId = (await getUserIdFromName(broadcaster))!;
  // return await apiClient.asUser(userId, ctx => {
  return await apiClient?.chat.getChannelBadges(broadcasterId);
  // });
};

export const getChannelSubscriptions = async (broadcaster: string) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.subscriptions.getSubscriptions(broadcaster);
  });
};

export const getUserSubscriptions = async (
  broadcaster: string,
  user: string,
) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.subscriptions.getSubscriptionForUser(broadcaster, user);
  });
};

export const getChannelTeam = async (broadcaster: string) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.teams.getTeamById(broadcaster);
  });
};

export const shoutoutUser = async (broadcaster: string, user: string) => {
  return await apiClient?.asUser(userId.value, (ctx) => {
    return ctx.chat.shoutoutUser(broadcaster, user);
  });
};

export default apiClient;
