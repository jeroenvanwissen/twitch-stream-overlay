import type { Command } from '@/types/chat';

const commandFiles = import.meta.glob('./*.ts', {
	import: 'default',
	eager: true,
});

const commands: Command[] = [];

Object.entries(commandFiles)
	.forEach((page) => {
		commands.push(page[1] as Command);
	});

commands.forEach((command) => {
	command.init();
});

console.log('Commands loaded:', commands);

export const allCommands = commands;

export const broadcasterCommands = commands.filter(command => command.permission === 'broadcaster');
export const moderatorCommands = commands.filter(command => command.permission === 'moderator');
export const vipCommands = commands.filter(command => command.permission === 'vip');
export const subscriberCommands = commands.filter(command => command.permission === 'subscriber');
export const everyoneCommands = commands.filter(command => command.permission === 'everyone');
