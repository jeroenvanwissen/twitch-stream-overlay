import chatClient from '@/lib/twitch/chatClient'
import { addTasks } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'task',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} Use !task <task> to add a task. Example: !task Finish the report ( comma separated tasks are allowed )`
      )
      return
    }

    const tasks = params
      .join(' ')
      .split(',')
      .map(task => task.trim())
      .filter(task => task.length > 0)

    if (tasks.length > 0) {
      addTasks(message.userInfo.userId, message.userInfo.userName, tasks)
      const text = `@${message.userInfo.displayName} Added task(s): ${tasks.join(', ')}`
      await chatClient.say(channel, text)
    }
  }
}

export default command
