import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'muted',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    await chatClient.say(
      channel,
      `Some streams, I don't unmute the mic during breaks. It can be because of open windows, washing maschine making noise, workers around the house... or just not wanting to use my voice. I will be active in chat tho... jeroen7Cheers`
    )
  }
}

export default command
