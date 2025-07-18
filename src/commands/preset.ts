import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'preset',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    usePomodoroStore().reset()
    const text = 'Pomodoro timer reset!'
    await chatClient.say(channel, text)
  }
}

export default command
