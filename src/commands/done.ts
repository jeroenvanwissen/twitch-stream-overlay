import chatClient from '@/lib/twitch/chatClient'
import { findTask, markDone, tasksByUser } from '@/store/tasks'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'done',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      await chatClient.say(
        channel,
        `@${message.userInfo.displayName} Use !done <task> to mark your current task as done, or !done all to mark all tasks as done.`
      )
      return
    }

    if (params[0].toLowerCase() === 'all') {
      const userTasks = tasksByUser.value.get(message.userInfo.userId) || []
      const unDoneTasks = userTasks.filter(task => !task.done)

      if (unDoneTasks.length === 0) {
        await chatClient.say(channel, `@${message.userInfo.displayName} You have no tasks to mark as done!`)
        return
      } else {
        unDoneTasks.forEach(task => markDone(task.id, message.userInfo.userName))
        await chatClient.say(channel, `@${message.userInfo.displayName} All your tasks have been marked as done!`)
        return
      }
    } else {
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
      if (task.done) {
        await chatClient.say(channel, `@${message.userInfo.displayName} This task is already marked as done!`)
        return
      }
      markDone(task.id, message.userInfo.userName)
      await chatClient.say(channel, `@${message.userInfo.displayName} You have marked the task "${task.text}" as done!`)
      return
    }
  }
}

export default command
