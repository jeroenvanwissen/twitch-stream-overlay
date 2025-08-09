import chatClient from '@/lib/twitch/chatClient';
import { findTask, markDone, tasksByUser } from '@/store/tasks';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'done',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (params!.length === 0) {
			const text = `Use !done <task> to mark your current task as done, or !done all to mark all tasks as done.`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		if (params[0].toLowerCase() === 'all') {
			const userTasks = tasksByUser.value.get(message.userInfo.userId) || [];
			const unDoneTasks = userTasks.filter(task => !task.done);

			if (unDoneTasks.length === 0) {
				const text = `You have no tasks to mark as done!`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
			}
			else {
				unDoneTasks.forEach(task => markDone(task.id, message.userInfo.userName));
				const text = `All your tasks have been marked as done!`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
			}
		}
		else {
			const task = findTask(params.at(0)!, message.userInfo.userName);
			if (!task) {
				const text = `Task not found! Please ensure the task exists.`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
				return;
			}
			// If all correct, this statement should never be true.
			if (task.userId !== message.userInfo.userId) {
				const text = `You can only mark your own tasks as done!`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
				return;
			}
			if (task.done) {
				const text = `This task is already marked as done!`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
				return;
			}
			markDone(task.id, message.userInfo.userName);
			const text = `You have marked the task "${task.text}" as done!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default command;
