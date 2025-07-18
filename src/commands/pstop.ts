import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'pstop',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    usePomodoroStore().stop()
    const text = 'Pomodoro timer stopped!'
    await chatClient.say(channel, text)
  }
}

export default command
