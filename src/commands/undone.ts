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
      const text = `@${message.userInfo.displayName} Use !undone <task> to mark a task as undone. Example: !undone 1 (where 1 is the task ID)`
      await chatClient.say(channel, text, {
        replyTo: message.id
      })
      return
    }

    const task = findTask(params.at(0)!, message.userInfo.userName)
    if (!task) {
      const text = `@${message.userInfo.displayName} Task not found! Please ensure the task exists.`
      await chatClient.say(channel, text, {
        replyTo: message.id
      })
      return
    }
    // If all correct, this statement should never be true.
    if (task.userId !== message.userInfo.userId) {
      const text = `@${message.userInfo.displayName} You can only mark your own tasks as done!`
      await chatClient.say(channel, text, {
        replyTo: message.id
      })
      return
    }
    if (!task.done) {
      const text = `@${message.userInfo.displayName} This task is not marked as done!`
      await chatClient.say(channel, text, {
        replyTo: message.id
      })
      return
    }
    markUndone(task.id, message.userInfo.userName)
    const text = `@${message.userInfo.displayName} You have marked the task "${task.text}" as undone!`
    await chatClient.say(channel, text, {
      replyTo: message.id
    })
    return
  }
}

export default command
