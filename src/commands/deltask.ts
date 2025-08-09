import chatClient from '@/lib/twitch/chatClient'
import { deleteTask, findTask } from '@/store/tasks'
import type { Command } from '@/types/chat'
import { text } from 'stream/consumers';

const command: Command = {
  name: 'deltask',
  permission: 'everyone',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, broadcasterId, params, message }) => {
    if (params!.length === 0) {
      const text =`@${message.userInfo.displayName} Use !deltask <task> to delete a task. Example: !deltask 1 (where 1 is the task ID)`;
      await chatClient.say(channel, text, {
        replyTo: message.id
      });
      return
    }

    const task = findTask(params.at(0)!, message.userInfo.userName)
    if (!task) {
      const text = `@${message.userInfo.displayName} Task not found! Please ensure the task exists.`;
      await chatClient.say(channel, text, {
        replyTo: message.id
      });
      return
    }
    // If all correct, this statement should never be true.
    if (task.userId !== message.userInfo.userId) {
      const text = `@${message.userInfo.displayName} You can only delete your own tasks!`;
      await chatClient.say(channel, text, {
        replyTo: message.id
      });
      return
    }
    deleteTask(task.id, message.userInfo.userName)
    const text = `@${message.userInfo.displayName} You have deleted the task "${task.text}"!`;
    await chatClient.say(channel, text, {
      replyTo: message.id
    });
    return
  }
}

export default command
