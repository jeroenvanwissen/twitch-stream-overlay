import { Bot } from '@twurple/easy-bot'

import { secondsToDuration } from '@/lib/dateTime'
import apiClient, { getUserIdFromName, shoutoutUser } from '@/lib/twitch/apiClient'
import { botAuthProvider } from '@/lib/twitch/authClient'
import chatClient from '@/lib/twitch/chatClient'
import { TwitchClient } from '@/lib/twitch/twitchClient'
import { botUser, botUserId, user } from '@/store/auth'
import { latestSubscriber, messageNow } from '@/store/config'

const bot = new Bot({
  authProvider: botAuthProvider,
  channels: [user.value!.name],
  debug: true,
  chatClientOptions: {
    requestMembershipEvents: true
  }
})

TwitchClient.botApiClient!.users.getUserByName(import.meta.env.VITE_TWITCH_BOT_NAME).then(user => {
  botUserId.value = user!.id
  botUser.value = user!
})

bot.onConnect(async () => {
  // await apiClient.moderation.deleteChatMessages(user.value!.id);
  await bot.say(user.value!.name, 'Chatbot connected!')
})

bot.onJoin(async ({ broadcasterName, userName }) => {
  // await bot.say(broadcasterName, `Welcome, @${userName}!`);
})

bot.onSubGift(async ({ broadcasterName, gifterName, userName }) => {
  await bot.say(broadcasterName, `Thanks @${gifterName} for gifting a subscription to @${userName}!`)
})

bot.onBan(async ({ broadcasterName, userName }) => {
  await bot.say(broadcasterName, `Trash taken out! @${userName} has been banned!`)
})

bot.onTimeout(async ({ broadcasterName, userName, duration }) => {
  await bot.say(
    broadcasterName,
    `Take a break, @${userName}! You have been timed out for ${duration! > 3600 ? secondsToDuration(duration!) : duration} seconds!`
  )
})

bot.onLeave(async ({ broadcasterName, userName }) => {
  // await bot.say(broadcasterName, `Goodbye, @${userName}!`);
})

bot.onRaid(async ({ broadcasterName, userName, viewerCount }) => {
  await bot.announce(broadcasterName, `Thanks @${userName} for raiding with ${viewerCount} viewers!`, 'primary')
  const broadcasterId = await getUserIdFromName(broadcasterName)
  const userId = await getUserIdFromName(userName)
  await shoutoutUser(broadcasterId!, userId!).catch(async e => {
    const error = JSON.parse(e.message.split('Body:')[1])
    await chatClient.say(broadcasterName, error.message)
  })
  await messageNow(`Thanks @${userName} for raiding with ${viewerCount} viewers!`)
})

bot.onChatClear(async ({ broadcasterName }) => {
  await bot.say(broadcasterName, `Chat has been cleared!`)
})

bot.onSub(async ({ broadcasterName, userName }) => {
  await bot.say(broadcasterName, `Thanks @${userName} for subscribing to the channel!`)
  latestSubscriber.value = (await apiClient!.users.getUserByName(userName))!
})
bot.onResub(async ({ broadcasterName, userName, months }) => {
  await bot.say(broadcasterName, `Thanks @${userName} for subscribing to the channel for a total of ${months} months!`)
})
// bot.onSubGift(async ({ broadcasterName, gifterDisplayName, userName }) => {
//     await bot.say(broadcasterName, `Thanks @${gifterDisplayName} for gifting a subscription to @${userName}!`);
// });
// bot.onCommunitySub(async ({ broadcasterName, gifterDisplayName, count }) => {
//     await bot.say(broadcasterName, `Thanks @${gifterDisplayName} for gifting ${count} subscriptions to the community!`);
// });
bot.onCommunityPayForward(async ({ broadcasterName, gifterDisplayName, originalGifterDisplayName }) => {
  await bot.say(
    broadcasterName,
    `Thanks @${gifterDisplayName} for paying forward a gift from ${originalGifterDisplayName}!`
  )
})
bot.onGiftPaidUpgrade(async ({ broadcasterName, gifterDisplayName, userName }) => {
  await bot.say(broadcasterName, `Thanks @${userName} for continuing the gift sub gifted by ${gifterDisplayName}!`)
})

// location.reload();
