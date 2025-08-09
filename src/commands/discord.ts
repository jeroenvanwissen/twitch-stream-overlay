import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'discord',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    const text = `Join the Discord server for after hour chats... https://discord.gg/rC6YJbN`;
    await chatClient.say(channel, text, {
      replyTo: message.id
    });
  }
}

export default command
