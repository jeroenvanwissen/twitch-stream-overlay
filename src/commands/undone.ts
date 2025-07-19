import chatClient from '@/lib/twitch/chatClient'
import { findTask, markUndone } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'undone',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} Use !undone <task> to mark a task as undone. Example: !undone 1 (where 1 is the task ID)`
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
      await chatClient.say(channel, `@${message.userInfo.displayName} You can only mark your own tasks as done!`)
      return
    }
    if (!task.done) {
      await chatClient.say(channel, `@${message.userInfo.displayName} This task is not marked as done!`)
      return
    }
    markUndone(task.id, message.userInfo.userName)
    await chatClient.say(channel, `@${message.userInfo.displayName} You have marked the task "${task.text}" as undone!`)
    return
  }
}

export default command
