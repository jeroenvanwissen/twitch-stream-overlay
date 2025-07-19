import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'jeroen',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel }) => {
    await chatClient.say(
      channel,
      `How to pronounce my name: https://www.twitch.tv/jeroenvanwissen/clip/CleanSneakySwallowSoonerLater-UajfGXXffu5W2IoK`
    )
  }
}

export default command
