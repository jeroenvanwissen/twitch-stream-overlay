import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'ppomos',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} You need to specify the amount of pomodoros to set! Usage: !ppomos <number of pomodoros>`
      )
      return
    }

    const pomodoros = params.at(0)
    if (!pomodoros || isNaN(Number(pomodoros)) || Number(pomodoros) <= 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} Please provide a valid number of pomodoros to set!`
      )
      return
    }

    usePomodoroStore().setTotalPomos(Number(pomodoros))
    const text = `@${message.userInfo.displayName} Pomodoro timer total pomodoros set to ${pomodoros}!`

    await chatClient.say(channel, text)
  }
}

export default command
