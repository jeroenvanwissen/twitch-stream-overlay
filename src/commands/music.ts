import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'music',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    const text = `We play random music here, mostly rock..blues. Also, usually we have our own DJ @f0xb17 making sure we hear some nice tunes...`;
    await chatClient.say(channel, text, {
      replyTo: message.id
    });
  }
}

export default command
