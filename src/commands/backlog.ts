import chatClient from '@/lib/twitch/chatClient'
import { tasksByUser } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'backlog',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    const userTasks = tasksByUser.value.get(message.userInfo.userId) || []
    const unDoneTasks = userTasks.filter(task => !task.done)

    if (unDoneTasks.length === 0) {
      const text = `@${message.userInfo.displayName} You have no tasks in your backlog!`
      await chatClient.say(channel, text, {
        replyTo: message.id
      })
      return
    }

    const taskList = unDoneTasks.map(task => `#${task.id}: ${task.text}${task.focused ? ' (focused)' : ''}`).join(' | ')

    const text = `@${message.userInfo.displayName} Here are your tasks in the backlog: ${taskList}`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
  }
}

export default command
