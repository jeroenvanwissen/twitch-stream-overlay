import chatClient from '@/lib/twitch/chatClient'
import { clearDoneTasks } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'cleardone',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    clearDoneTasks()
    const text = `All completed tasks have been cleared!`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
    return
  }
}

export default command
