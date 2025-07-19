import chatClient from '@/lib/twitch/chatClient'
import { findTask, focusTask } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'focus',
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

    const task = findTask(params.at(0)!, message.userInfo.userName)
    if (!task) {
      await chatClient.say(channel, `@${message.userInfo.displayName} Task not found! Please ensure the task exists.`)
      return
    }

    // If all correct, this statement should never be true.
    if (task.userId !== message.userInfo.userId) {
      await chatClient.say(channel, `@${message.userInfo.displayName} You can only focus on your own tasks!`)
      return
    }

    if (task.focused) {
      await chatClient.say(channel, `@${message.userInfo.displayName} You are already focused on this task!`)
      return
    }

    if (task.done) {
      await chatClient.say(channel, `@${message.userInfo.displayName} You cannot focus on a completed task!`)
      return
    }

    focusTask(parseInt(params[0]), message.userInfo.userName)
    const text = `@${message.userInfo.displayName} You are now focused on the task: ${task.text}`
    await chatClient.say(channel, text)
  }
}

export default command
