import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'discord',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    await chatClient.say(channel, `Join the Discord server for after hour chats... https://discord.gg/rC6YJbN`)
  }
}

export default command
