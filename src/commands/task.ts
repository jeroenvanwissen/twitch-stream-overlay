import chatClient from '@/lib/twitch/chatClient';
import { addTasks } from '@/store/tasks';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'task',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (params!.length === 0) {
			const text = `Use !task <task> to add a task. Example: !task Finish the report ( comma separated tasks are allowed )`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const tasks = params
			.join(' ')
			.split(',')
			.map(task => task.trim())
			.filter(task => task.length > 0);

		if (tasks.length > 0) {
			addTasks(message.userInfo.userId, message.userInfo.userName, tasks);
			const text = `Added task(s): ${tasks.join(', ')}`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default command;
