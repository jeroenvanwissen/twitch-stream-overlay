import chatClient from '@/lib/twitch/chatClient'
import { clearTasks } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'cleartasks',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    clearTasks()
    await chatClient.say(channel, `All tasks have been cleared!`)
    return
  }
}

export default command
