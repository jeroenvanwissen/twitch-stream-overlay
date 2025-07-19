import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'keyboard',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    await chatClient.say(
      channel,
      `Today I work on the Keychron K2 with Keychron Silent K Pro Red switches and a purple gradient keycap set. I have a nice collection of keyboards...it's a bit of a problem..`
    )
  }
}

export default command
