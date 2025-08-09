import chatClient from '@/lib/twitch/chatClient';
import { findTask, focusTask, markDone, tasks } from '@/store/tasks';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'next',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (params!.length === 0) {
			const text = `Use !next <task> to mark your current task as done and focus on the next task. Example: !next Finish the report`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const currentTask = tasks.value.find(task => task.focused && task.userId === message.userInfo.userId);
		if (currentTask) {
			markDone(currentTask.id, message.userInfo.userName);
		}

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
			const text = `You can only focus on your own tasks!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		if (task.focused) {
			const text = `You are already focused on this task!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		if (task.done) {
			const text = `You cannot focus on a completed task!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		focusTask(Number.parseInt(params[0]), message.userInfo.userName);
		const text = `You are now focused on the task: ${task.text}`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
