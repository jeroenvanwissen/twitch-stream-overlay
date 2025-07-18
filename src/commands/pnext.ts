import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'pnext',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    usePomodoroStore().nextPomo()
    const state = usePomodoroStore().state.value
    const newSession = state.isFocusMode ? 'focus' : 'break'
    const text = `Pomodoro timer switched to the next ${newSession} session!`
    await chatClient.say(channel, text)
  }
}

export default command
