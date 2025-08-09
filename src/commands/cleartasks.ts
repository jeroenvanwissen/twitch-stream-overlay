import chatClient from '@/lib/twitch/chatClient'
import { clearTasks } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'cleartasks',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    clearTasks()
    const text = `All tasks have been cleared!`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
  }
}

export default command
