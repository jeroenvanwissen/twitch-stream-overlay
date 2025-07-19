import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'odin',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    await chatClient.say(
      channel,
      `The Odin Project - Full Stack JavaScript - https://www.theodinproject.com/paths/full-stack-javascript`
    )
  }
}

export default command
