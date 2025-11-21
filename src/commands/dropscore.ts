import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';
import { getDropStats } from '@/store/dropGame';

const command: Command = {
	name: 'dropscore',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const stats = getDropStats(message.userInfo.userName);
		if (!stats) {
			const text = `@${message.userInfo.displayName}, no drop attempts recorded yet. Start with !drop`;
			await chatClient.say(channel, text, { replyTo: message.id });
			return;
		}

		const attempts = stats.attempts || 0;
		const landed = stats.landed || 0;
		const accuracy = attempts > 0 ? ((landed / attempts) * 100).toFixed(1) : '0.0';
		const average = landed > 0 ? (stats.totalPoints / landed).toFixed(1) : '0.0';

		const text = `@${message.userInfo.displayName} — attempts: ${attempts}, landed: ${landed}/${attempts} (${accuracy}%), avg: ${average} pts, best: ${stats.best} pts.`;
		await chatClient.say(channel, text, { replyTo: message.id });
	},
};

export default command;
