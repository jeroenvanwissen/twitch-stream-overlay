import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'pomodoro',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    const text = `I try to work with the Pomodoro technique to stay focused. Most of the time I'll be focused at work for 50 minutes before taking a 10 minute break. Lunch breaks will be around 1hour. But, most of the times I just forget the breaks and when I do remember them, I just take a too long break...`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
  }
}

export default command
