import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'baner',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    const text = `it's !banger you fool!!`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
  }
}

export default command
