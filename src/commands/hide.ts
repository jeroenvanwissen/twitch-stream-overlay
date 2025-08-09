import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';
import { setVisibility } from '@/store/visibility';
import type { ComponentKey } from '@/store/visibility';

const command: Command = {
	name: 'hide',
	permission: 'moderator',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (!params[0]) {
			const text = `@${message.userInfo.displayName} Please specify a component to hide. Available: pomodoro, tasks, spotify, deaths, emotes, ducky, seagull`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const componentName = params[0].toLowerCase() as ComponentKey;
		const validComponents = ['pomodoro', 'tasks', 'spotify', 'deaths', 'emotes', 'ducky', 'seagull'];

		if (!validComponents.includes(componentName)) {
			const text = `@${message.userInfo.displayName} Invalid component "${componentName}". Available: ${validComponents.join(', ')}`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		setVisibility(componentName, false);
		const text = `@${message.userInfo.displayName} ${componentName} component is now hidden.`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
