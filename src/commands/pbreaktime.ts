import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'pbreaktime',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} You need to specify a time to set! Usage: !pbreaktime <time in minutes>`
      )
      return
    }

    const minutes = params.at(0)
    if (!minutes || isNaN(Number(minutes)) || Number(minutes) <= 0) {
      await chatClient.say(channel, `@${message.userInfo.displayName} Please provide a valid number of minutes to set!`)
      return
    }

    usePomodoroStore().setBreakLength(Number(minutes))
    const text = `@${message.userInfo.displayName} Pomodoro timer break time set to ${minutes} minute(s)!`

    await chatClient.say(channel, text)
  }
}

export default command
