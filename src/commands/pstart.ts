import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'pstart',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    usePomodoroStore().start()
    const state = usePomodoroStore().state.value
    const text = `Pomodoro timer started with a ${state.focusLength}-minute focus session!`
    await chatClient.say(channel, text)
  }
}

export default command
