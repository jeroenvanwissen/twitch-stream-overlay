import chatClient from '@/lib/twitch/chatClient'
import { clearDoneTasks } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'cleardone',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    clearDoneTasks()
    await chatClient.say(channel, `All completed tasks have been cleared!`)
    return
  }
}

export default command
