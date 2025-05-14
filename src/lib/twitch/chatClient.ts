import type { HelixChatBadgeVersion } from '@twurple/api'
import { ChatClient, type ChatMessage } from '@twurple/chat'

import { secondsToDuration } from '@/lib/dateTime'
import { spotifyClient } from '@/lib/spotify/spotifyClient'
import { getUserData } from '@/lib/twitch/getUserData'
import messageParser, { ALLOWED_ATTR, ALLOWED_TAGS, FORBID_ATTR, FORBID_TAGS } from '@/lib/twitch/messageParser'
import { scopes, user } from '@/store/auth'
import { addMessage, chatBadges, ChatPermissions, Message, whitelistedUsers } from '@/store/chat'

import { getChannelBadges, getChannelFollowers, getUserIdFromName, shoutoutUser } from '@/lib/twitch/apiClient'
import { TwitchClient } from '@/lib/twitch/twitchClient'
import {
  activateCommand,
  addCommand,
  Command,
  COMMAND_BLACKLIST,
  commands,
  deactivateCommand,
  deleteCommand,
  editCommand,
  formatCommandMessage,
  getCommand,
  PUBLIC_COMMANDS
} from '@/store/commands'
import { usePomodoroStore } from '@/store/pomodoro'
import { addTasks, clearTasks, deleteTask, findTask, focusTask, markDone, nextTask, tasksByUser } from '@/store/tasks'
import { ref } from 'vue'

export const chatClient = new ChatClient({
  authProvider: TwitchClient.botAuthProvider!,
  channels: [user.value!.name],
  authIntents: scopes,
  isAlwaysMod: true
})

const messageHandler = ref()

messageHandler.value?.unbind()

messageHandler.value = chatClient.onMessage(async (channel: string, user: string, text: string, msg: ChatMessage) => {
  const userData = (await getUserData(channel, msg.userInfo.userId))!

  if (userData.badges.length == 0) {
    const channelBadges = await getChannelBadges(channel, msg.userInfo.userId)

    userData.badges =
      msg.userInfo.badges.size > 0
        ? [...msg.userInfo.badges.entries()].map(([key, value]) => {
            const channelBadge = channelBadges!.find(badge => badge.id == key)
            if (channelBadge?.versions.some(version => version.id == value)) {
              return channelBadge.getVersion(value) as HelixChatBadgeVersion
            }

            return chatBadges.value.find(badge => badge.id == key)!.getVersion(value) as HelixChatBadgeVersion
          })
        : []
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
      color: msg.userInfo.color ?? '#FFFFFF',
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
      pronoun: userData.pronoun
    },
    message: messageParser(msg.userInfo.userName, msg.id, text, msg.emoteOffsets),
    plainText: text
  }

  if (newMsg.isRedemption && newMsg.rewardId) {
    await handleRedemption(channel, newMsg)
  } else if (text.startsWith('!')) {
    const [command, ...params] = text.slice(1).split(' ')
    await handleCommand({ channel, command, params, newMsg })
  } else {
    await addMessage(newMsg)
  }
})

export const levels = ['broadcaster', 'moderator', 'vip', 'subscriber', 'everyone']

export const hasMinLevel = (userInfo: Message['userInfo'], minLevel: string) => {
  if (userInfo.isBroadcaster) return true
  if (minLevel == 'moderator' && userInfo.isMod) return true
  if (minLevel == 'vip' && (userInfo.isMod || userInfo.isVip)) return true
  if (minLevel == 'subscriber' && (userInfo.isSubscriber || userInfo.isMod || userInfo.isVip)) return true
  return true
}

// location.reload();
export default chatClient

const handleRedemption = async (channel: string, msg: Message) => {
  console.log('handleRedemption', channel, msg)
  if (msg.rewardId && msg.plainText) {
    // Spotify Song Request
    if (msg.plainText.includes('spotify.com/track/')) {
      const success = await spotifyClient.addToQueue(msg.plainText)
      if (success) {
        await chatClient.say(channel, `@${msg.userInfo.displayName} Your song has been added to the queue!`)
      } else {
        await chatClient.say(
          channel,
          `@${msg.userInfo.displayName} Failed to add song to queue. Make sure you provided a valid Spotify track URL!`
        )
      }
    }
  }
}
const handleCommand = async ({
  channel,
  command,
  params,
  newMsg
}: {
  channel: string
  command: string
  params: string[]
  newMsg: Message
}) => {
  console.log({ channel, command, params, newMsg })
  const broadcasterId = (await getUserIdFromName(channel))!

  const pomodoro = usePomodoroStore()

  // Try to handle as a custom command first
  const customCommand = getCommand(command)
  if (customCommand && customCommand.isActive) {
    const formattedMessage = formatCommandMessage(customCommand.message, newMsg.userInfo.userName)
    await chatClient.say(channel, formattedMessage)
    return
  }

  // Handle built-in commands
  switch (command) {
    case 'cadd':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Only the broadcaster can manage commands!`)
        return
      }
      if (params.length < 2) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !cadd <command> <message>`)
        return
      }
      const commandName = params[0]
      const commandMessage = params.slice(1).join(' ')
      if (COMMAND_BLACKLIST.includes(commandName)) {
        await chatClient.say(
          channel,
          `@${newMsg.userInfo.displayName} Command ${commandName} is a built-in command and cannot be added!`
        )
        return
      }
      if (addCommand(commandName, commandMessage)) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${commandName} added successfully!`)
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${commandName} already exists!`)
      }
      break

    case 'cdel':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Only the broadcaster can manage commands!`)
        return
      }
      if (params.length !== 1) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !cdel <command>`)
        return
      }
      if (deleteCommand(params[0])) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} deleted successfully!`)
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} not found!`)
      }
      break

    case 'cactivate':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Only the broadcaster can manage commands!`)
        return
      }
      if (params.length !== 1) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !cactivate <command>`)
        return
      }
      if (activateCommand(params[0])) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} activated successfully!`)
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} not found!`)
      }
      break

    case 'cdeactivate':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Only the broadcaster can manage commands!`)
        return
      }
      if (params.length !== 1) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !cdeactivate <command>`)
        return
      }
      if (deactivateCommand(params[0])) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} deactivated successfully!`)
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${params[0]} not found!`)
      }
      break

    case 'cedit':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Only the broadcaster can manage commands!`)
        return
      }
      if (params.length < 2) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !cedit <command> <message>`)
        return
      }
      const editCommandName = params[0]
      const editCommandMessage = params.slice(1).join(' ')
      if (editCommand(editCommandName, editCommandMessage)) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${editCommandName} edited successfully!`)
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Command ${editCommandName} not found!`)
      }
      break

    case 'task':
    case 'add':
      if (params.length > 0) {
        const tasks = params
          .join(' ')
          .split(',')
          .map(task => task.trim())
          .filter(task => task.length > 0)
        if (tasks.length > 0) {
          addTasks(newMsg.userInfo.userId, newMsg.userInfo.userName, tasks)
          await chatClient.say(channel, `@${newMsg.userInfo.displayName} added ${tasks.length} task(s)`)
        }
      }
      break

    case 'focus':
      if (params.length === 1) {
        const task = findTask(params[0], newMsg.userInfo.userName)
        if (task) {
          if (task.userId === newMsg.userInfo.userId) {
            focusTask(parseInt(params[0]), newMsg.userInfo.userName)
            await chatClient.say(channel, `Now focusing on task #${task.id}: ${task.text}`)
          } else {
            await chatClient.say(channel, `@${newMsg.userInfo.displayName} You can only focus on your own tasks!`)
          }
        }
      }
      break

    case 'next':
      if (params.length === 1) {
        const newTask = findTask(params[0], newMsg.userInfo.userName)
        if (newTask) {
          if (newTask.userId === newMsg.userInfo.userId) {
            nextTask(parseInt(params[0]), newMsg.userInfo.userName)
            await chatClient.say(channel, `Moving to next task #${newTask.id}: ${newTask.text}`)
          } else {
            await chatClient.say(channel, `@${newMsg.userInfo.displayName} You can only move to your own tasks!`)
          }
        }
      }
      break

    case 'done':
      if (params.length === 0) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} Usage: !done <taskId> or !done all`)
      } else if (params[0].toLowerCase() === 'all') {
        const userTasks = tasksByUser.value.get(newMsg.userInfo.userId) || []
        const undoneTasks = userTasks.filter((task: { done: boolean }) => !task.done)

        if (undoneTasks.length === 0) {
          await chatClient.say(channel, `@${newMsg.userInfo.displayName} You have no incomplete tasks.`)
        } else {
          undoneTasks.forEach((task: { id: number }) => markDone(task.id, newMsg.userInfo.userName))
          await chatClient.say(channel, `@${newMsg.userInfo.displayName} Marked ${undoneTasks.length} task(s) as done.`)
        }
      } else {
        const task = findTask(params[0], newMsg.userInfo.userName)
        if (task) {
          if (task.userId === newMsg.userInfo.userId) {
            markDone(parseInt(params[0]), newMsg.userInfo.userName)
            await chatClient.say(channel, `Marked task #${task.id} as done: ${task.text}`)
          } else {
            await chatClient.say(channel, `@${newMsg.userInfo.displayName} You can only mark your own tasks as done!`)
          }
        }
      }
      break

    case 'deltask':
    case 'taskdel':
      if (params.length === 1) {
        const task = findTask(params[0], newMsg.userInfo.userName)
        if (task) {
          if (task.userId === newMsg.userInfo.userId) {
            deleteTask(parseInt(params[0]), newMsg.userInfo.userName)
            await chatClient.say(channel, `Deleted task #${task.id}: ${task.text}`)
          } else {
            await chatClient.say(channel, `@${newMsg.userInfo.displayName} You can only delete your own tasks!`)
          }
        }
      }
      break

    case 'cleartasks':
      if (newMsg.userInfo.isBroadcaster) {
        clearTasks()
        await chatClient.say(channel, 'All tasks have been cleared')
      } else {
        await chatClient.say(channel, 'Only the broadcaster can clear all tasks')
      }
      break

    case 'so':
      if (!hasMinLevel(newMsg.userInfo, 'moderator')) return

      if (params!.length == 0) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} You need to specify a user to shoutout!`)
        return
      }

      await shoutoutUser(broadcasterId!, (await getUserIdFromName(params.at(0)!.replace('@', '')))!).catch(async e => {
        const error = JSON.parse(e.message.split('Body:')[1])
        await chatClient.say(channel, error.message)
      })
      break
    case 'banger':
      const currentPlayback = await spotifyClient.getCurrentlyPlaying()
      if (currentPlayback && currentPlayback.item && 'artists' in currentPlayback.item) {
        await spotifyClient.addToPlaylist(currentPlayback.item.uri)
        await chatClient.say(
          channel,
          `Added ${currentPlayback.item.name} by ${currentPlayback.item.artists[0].name} to the bangers playlist!`
        )
      } else {
        await chatClient.say(channel, `No track is currently playing!`)
      }
      break

    case 'followage':
      getChannelFollowers(broadcasterId, newMsg.userInfo.userId).then(async result => {
        const follow = result?.data[0]
        if (follow) {
          const currentTimestamp = Date.now()
          const followStartTimestamp = follow.followDate.getTime()
          await chatClient.say(
            channel,
            `@${newMsg.userInfo.displayName} You have been following for ${secondsToDuration((currentTimestamp - followStartTimestamp) / 1000)}!`
          )
        } else {
          await chatClient.say(channel, `@${newMsg.userInfo.displayName} You are not following!`)
        }
      })
      break
    case 'pstart':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      pomodoro.start()
      await chatClient.say(channel, 'Pomodoro timer started!')
      break

    case 'pstop':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      pomodoro.stop()
      await chatClient.say(channel, 'Pomodoro timer stopped!')
      break

    case 'preset':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      pomodoro.reset()
      await chatClient.say(channel, 'Pomodoro timer reset!')
      break

    case 'ptimeadd':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      if (params.length === 0) {
        await chatClient.say(channel, 'Usage: !timeadd <minutes>')
        break
      }
      const minutes = parseInt(params[0])
      if (isNaN(minutes) || minutes <= 0) {
        await chatClient.say(channel, 'Please provide a valid number of minutes!')
        break
      }
      pomodoro.addTime(minutes)
      await chatClient.say(channel, `Added ${minutes} minutes to the timer!`)
      break

    case 'ppomos':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      if (params.length === 0) {
        await chatClient.say(channel, 'Usage: !pomos <count>')
        break
      }
      const count = parseInt(params[0])
      if (isNaN(count) || count <= 0) {
        await chatClient.say(channel, 'Please provide a valid number of pomodoros!')
        break
      }
      pomodoro.setTotalPomos(count)
      await chatClient.say(channel, `Set total pomodoros to ${count}!`)
      break

    case 'ppomotime':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      if (params.length === 0) {
        await chatClient.say(channel, 'Usage: !pomotime <minutes>')
        break
      }
      const focusTime = parseInt(params[0])
      if (isNaN(focusTime) || focusTime <= 0) {
        await chatClient.say(channel, 'Please provide a valid number of minutes!')
        break
      }
      pomodoro.setFocusLength(focusTime)
      await chatClient.say(channel, `Set focus time to ${focusTime} minutes!`)
      break

    case 'pbreaktime':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      if (params.length === 0) {
        await chatClient.say(channel, 'Usage: !breaktime <minutes>')
        break
      }
      const breakTime = parseInt(params[0])
      if (isNaN(breakTime) || breakTime <= 0) {
        await chatClient.say(channel, 'Please provide a valid number of minutes!')
        break
      }
      pomodoro.setBreakLength(breakTime)
      await chatClient.say(channel, `Set break time to ${breakTime} minutes!`)
      break

    case 'pnext':
      if (!newMsg.userInfo.isBroadcaster) {
        await chatClient.say(channel, 'Only the broadcaster can control the Pomodoro timer')
        break
      }
      pomodoro.nextPomo()
      const modeText = pomodoro.state.value.isFocusMode ? 'focus' : 'break'
      await chatClient.say(channel, `Moving to ${modeText} time!`)
      break
    case 'whitelist':
      if (!hasMinLevel(newMsg.userInfo, 'moderator')) return

      if (params!.length == 0) {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} You need to specify a user to whitelist!`)
        return
      }

      const permission: ChatPermissions = {
        userName: newMsg.userInfo.userName,
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORBID_TAGS,
        FORBID_ATTR
      }

      let filtered = false

      // if params includes noimg remove img from elements
      if (params.includes('noimg')) {
        filtered = true
        permission.ALLOWED_TAGS = permission.ALLOWED_TAGS.filter(element => element != 'img')
        permission.FORBID_TAGS = [...FORBID_TAGS, ...ALLOWED_TAGS.filter(element => element == 'img')]
        permission.ALLOWED_ATTR = []
        permission.FORBID_ATTR = FORBID_ATTR
      }

      if (await getUserIdFromName(params.at(0)!.replace('@', ''))) {
        whitelistedUsers.value = [
          ...whitelistedUsers.value.filter(user => user.userName != newMsg.userInfo.userName),
          permission
        ]
        if (filtered) {
          await chatClient.say(
            channel,
            `@${newMsg.userInfo.displayName} User ${params.at(0)} has been whitelisted with no images!`
          )
        } else {
          await chatClient.say(channel, `@${newMsg.userInfo.displayName} User ${params.at(0)} has been whitelisted!`)
        }
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} User ${params.at(0)} not found!`)
      }
      break
    case 'unwhitelist':
      if (!hasMinLevel(newMsg.userInfo, 'moderator')) return

      if (params!.length == 0) {
        await chatClient.say(
          channel,
          `@${newMsg.userInfo.displayName} You need to specify a user to remove from the whitelist!`
        )
        return
      }

      if (await getUserIdFromName(params.at(0)!.replace('@', ''))) {
        whitelistedUsers.value = whitelistedUsers.value.filter(user => user.userName != newMsg.userInfo.userName)
        await chatClient.say(
          channel,
          `@${newMsg.userInfo.displayName} User ${params.at(0)} has been removed from the whitelist!`
        )
      } else {
        await chatClient.say(channel, `@${newMsg.userInfo.displayName} User ${params.at(0)} not found!`)
      }
      break

    case 'commands':
      const activeCustomCommands = commands.value
        .filter((cmd: Command) => cmd.isActive)
        .map((cmd: Command) => cmd.name)
        .sort()

      const builtInCommands = COMMAND_BLACKLIST.filter(cmd => PUBLIC_COMMANDS.includes(cmd)).sort()

      const commandsList = [
        'Available commands:',
        activeCustomCommands.length > 0
          ? `Custom commands: ${activeCustomCommands.map(cmd => '!' + cmd).join(', ')}`
          : null,
        `Built-in commands: ${builtInCommands.map((cmd: string) => '!' + cmd).join(', ')}`
      ]
        .filter(Boolean)
        .join(' | ')

      await chatClient.say(channel, commandsList)
      break
    default:
      // await chatClient.say(
      //   channel,
      //   `@${newMsg.userInfo.displayName} Unknown command: ${command}`,
      // );
      break
  }
}

const giftCounts = new Map<string | undefined, number>()

chatClient.onCommunitySub(async (channel, gifterName, giftInfo) => {
  console.log('onCommunitySub', channel, gifterName, giftInfo)
  const previousGiftCount = giftCounts.get(gifterName) ?? 0
  giftCounts.set(gifterName, previousGiftCount + giftInfo.count)
  await chatClient.say(channel, `Thanks ${gifterName} for gifting ${giftInfo.count} subs to the community!`)
})

chatClient.onSubGift(async (channel, recipientName, subInfo) => {
  console.log('onSubGift', channel, recipientName, subInfo)
  const gifterName = subInfo.gifter
  const previousGiftCount = giftCounts.get(gifterName) ?? 0
  if (previousGiftCount > 0) {
    giftCounts.set(gifterName, previousGiftCount - 1)
  } else {
    await chatClient.say(channel, `Thanks ${gifterName} for gifting a sub to ${recipientName}!`)
  }
})
