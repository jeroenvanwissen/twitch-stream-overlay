import chatClient from '@/lib/twitch/chatClient'
import { deleteTask, findTask } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'deltask',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} Use !deltask <task> to delete a task. Example: !deltask 1 (where 1 is the task ID)`
      )
      return
    }

    const task = findTask(params.at(0)!, message.userInfo.userName)
    if (!task) {
      await chatClient.say(channel, `@${message.userInfo.displayName} Task not found! Please ensure the task exists.`)
      return
    }
    // If all correct, this statement should never be true.
    if (task.userId !== message.userInfo.userId) {
      await chatClient.say(channel, `@${message.userInfo.displayName} You can only delete your own tasks!`)
      return
    }
    deleteTask(task.id, message.userInfo.userName)
    await chatClient.say(channel, `@${message.userInfo.displayName} You have deleted the task "${task.text}"!`)
    return
  }
}

export default command
