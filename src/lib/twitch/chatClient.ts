import type { HelixChatBadgeVersion } from "@twurple/api";
import { ChatClient, type ChatMessage } from "@twurple/chat";

import { secondsToDuration } from "@/lib/dateTime";
import { getUserData } from "@/lib/twitch/getUserData";
import messageParser from "@/lib/twitch/messageParser";
import { scopes, user } from "@/store/auth";
import { addMessage, chatBadges, Message } from "@/store/chat";

import {
  getChannelBadges,
  getChannelFollowers,
  getUserIdFromName,
  shoutoutUser,
} from "@/lib/twitch/apiClient";
import { TwitchClient } from "@/lib/twitch/twitchClient";
import { ref } from "vue";

console.log("TwitchClient.botAuthProvider!", TwitchClient.botAuthProvider!);
export const chatClient = new ChatClient({
  authProvider: TwitchClient.botAuthProvider!,
  channels: [user.value!.name],
  authIntents: scopes,
  isAlwaysMod: true,
});

const messageHandler = ref();

messageHandler.value?.unbind();

messageHandler.value = chatClient.onMessage(
  async (channel: string, user: string, text: string, msg: ChatMessage) => {
    const userData = (await getUserData(channel, msg.userInfo.userId))!;

    if (userData.badges.length == 0) {
      const channelBadges = await getChannelBadges(
        channel,
        msg.userInfo.userId,
      );

      userData.badges =
        msg.userInfo.badges.size > 0
          ? [...msg.userInfo.badges.entries()].map(([key, value]) => {
              const channelBadge = channelBadges!.find(
                (badge) => badge.id == key,
              );
              if (
                channelBadge?.versions.some((version) => version.id == value)
              ) {
                return channelBadge.getVersion(value) as HelixChatBadgeVersion;
              }

              return chatBadges.value
                .find((badge) => badge.id == key)!
                .getVersion(value) as HelixChatBadgeVersion;
            })
          : [];
    }

    const newMsg: Message = {
      channelId: channel,
      date: msg.date,
      emoteOffsets: msg.emoteOffsets,
      id: msg.id,
      isCheer: msg.isCheer,
      isFirst: msg.isFirst,
      isHighlight: msg.isHighlight,
      isRedemption: msg.isRedemption,
      isReply: msg.isReply,
      isReturningChatter: msg.isReturningChatter,
      parentMessageId: msg.parentMessageId,
      parentMessageText: msg.parentMessageText,
      rewardId: msg.rewardId,
      userInfo: {
        avatarUrl: userData.profile_image_url,
        badgeInfo: msg.userInfo.badgeInfo,
        badges: userData.badges,
        color: msg.userInfo.color ?? "#FFFFFF",
        displayName: msg.userInfo.displayName,
        id: msg.userInfo.userId,
        isArtist: msg.userInfo.isArtist,
        isBroadcaster: msg.userInfo.isBroadcaster,
        isFounder: msg.userInfo.isFounder,
        isMod: msg.userInfo.isMod,
        isSubscriber: msg.userInfo.isSubscriber,
        isVip: msg.userInfo.isVip,
        userId: msg.userInfo.userId,
        userName: msg.userInfo.userName,
        userType: msg.userInfo.userType,
        pronoun: userData.pronoun,
      },
      message: messageParser(msg.id, text, msg.emoteOffsets),
    };

    console.log(newMsg);

    if (text.startsWith("!")) {
      const [command, ...params] = text.slice(1).split(" ");
      await handleCommand({ channel, command, params, newMsg });
    } else {
      await addMessage(newMsg);
    }
  },
);

export const levels = [
  "broadcaster",
  "moderator",
  "vip",
  "subscriber",
  "everyone",
];

export const hasMinLevel = (
  userInfo: Message["userInfo"],
  minLevel: string,
) => {
  if (userInfo.isBroadcaster) return true;
  if (minLevel == "moderator" && userInfo.isMod) return true;
  if (minLevel == "vip" && (userInfo.isMod || userInfo.isVip)) return true;
  if (
    minLevel == "subscriber" &&
    (userInfo.isSubscriber || userInfo.isMod || userInfo.isVip)
  )
    return true;
  return true;
};

// location.reload();
export default chatClient;
const handleCommand = async ({
  channel,
  command,
  params,
  newMsg,
}: {
  channel: string;
  command: string;
  params: string[];
  newMsg: Message;
}) => {
  console.log({ channel, command, params, newMsg });
  const broadcasterId = (await getUserIdFromName(channel))!;

  switch (command) {
    case "so":
      if (!hasMinLevel(newMsg.userInfo, "moderator")) return;

      if (params!.length == 0) {
        await chatClient.say(
          channel,
          `@${newMsg.userInfo.displayName} You need to specify a user to shoutout!`,
        );
        return;
      }
      const name = params.at(0)!.replace("@", "");
      const userId = await getUserIdFromName(name);
      await shoutoutUser(broadcasterId!, userId!).catch(async (e) => {
        const error = JSON.parse(e.message.split("Body:")[1]);
        await chatClient.say(channel, error.message);
      });
      break;
    case "followage":
      getChannelFollowers(broadcasterId, newMsg.userInfo.userId).then(
        async (result) => {
          const follow = result?.data[0];
          if (follow) {
            const currentTimestamp = Date.now();
            const followStartTimestamp = follow.followDate.getTime();
            await chatClient.say(
              channel,
              `@${newMsg.userInfo.displayName} You have been following for ${secondsToDuration((currentTimestamp - followStartTimestamp) / 1000)}!`,
            );
          } else {
            await chatClient.say(
              channel,
              `@${newMsg.userInfo.displayName} You are not following!`,
            );
          }
        },
      );
      break;
    default:
      await chatClient.say(
        channel,
        `@${newMsg.userInfo.displayName} Unknown command: ${command}`,
      );
      break;
  }
};

const giftCounts = new Map<string | undefined, number>();

chatClient.onCommunitySub(async (channel, gifterName, giftInfo) => {
  console.log("onCommunitySub", channel, gifterName, giftInfo);
  const previousGiftCount = giftCounts.get(gifterName) ?? 0;
  giftCounts.set(gifterName, previousGiftCount + giftInfo.count);
  await chatClient.say(
    channel,
    `Thanks ${gifterName} for gifting ${giftInfo.count} subs to the community!`,
  );
});

chatClient.onSubGift(async (channel, recipientName, subInfo) => {
  console.log("onSubGift", channel, recipientName, subInfo);
  const gifterName = subInfo.gifter;
  const previousGiftCount = giftCounts.get(gifterName) ?? 0;
  if (previousGiftCount > 0) {
    giftCounts.set(gifterName, previousGiftCount - 1);
  } else {
    await chatClient.say(
      channel,
      `Thanks ${gifterName} for gifting a sub to ${recipientName}!`,
    );
  }
});
