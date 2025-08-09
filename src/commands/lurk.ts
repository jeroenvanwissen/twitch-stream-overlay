import type { Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

import type { Command } from '@/types/chat';

import chatClient from '@/lib/twitch/chatClient';
import { replaceTemplatePlaceholders } from '@/lib/utils';

interface LurkStorage {
	lurkers: Ref<string[], string[]>;
	snarkyLurkReplies: string[];
	alreadyLurkingReplies: string[];
}

const command: Command<LurkStorage> = {
	name: 'lurk',
	permission: 'everyone',
	type: 'command',
	storage: {
		lurkers: useLocalStorage<string[]>('lurkers', []),
		snarkyLurkReplies: [
			'Oh, @{name} is going to !lurk? Don\'t strain yourself with all that... not chatting. We\'ll try to have fun without you.',
			'@{name} has bravely entered the lurk zone. We\'ll miss your... well, you know. Your active participation. Maybe.',
			'Another one bites the dust! @{name} is now a professional lurker. Enjoy your silent observations!',
			'Farewell, @{name}! May your lurk be ever watchful and your keyboard ever silent. We\'ll save you a pixelated seat.',
			'@{name} is off to their top-secret lurking mission. Don\'t worry, we\'ll try not to have *too* much fun without you.',
			'And just like that, @{name} vanishes into the shadows of !lurk. Try not to get too comfortable back there!',
			'It\'s true, @{name} is now officially in stealth mode. We appreciate your dedication to... being here, but not really.',
			'Well, look at @{name}, pulling a Houdini with the !lurk command. Don\'t forget to blink once in a while!',
			'Lurk initiated for @{name}. We\'ll assume you\'re busy with super important lurker business. Don\'t mind us!',
			'Confirmed: @{name} has successfully executed !lurk. Your silence is now deafening. Just kidding... mostly.',
			'@{name} has bravely chosen the path of the silent observer. We\'ll try not to be *too* loud without you.',
			'Poof! @{name} has vanished into the lurk dimension. Don\'t worry, we\'ll keep the pixels warm for you.',
			'And just like that, @{name} has activated stealth mode. Enjoy your top-secret mission in the background!',
			'Well, well, @{name} has decided to grace us with their absence. We\'ll be here, actively chatting... mostly.',
			'Lurk alert! @{name} is now officially in \'do not disturb\' mode. Feel free to just... exist.',
			'Our dear @{name} is now a professional lurker. May your tabs be many and your distractions few!',
			'@{name} has entered the passive viewing state. We appreciate your silent judgment from afar.',
			'It\'s true: @{name} is now part of the elite lurker squad. Don\'t forget to occasionally breathe!',
			'Going dark! @{name} has hit the !lurk button. We\'ll miss your... potential contributions.',
			'Confirmed: @{name} is now a ghost in the machine. Try not to miss us too much while you\'re busy not typing.',
		],
		alreadyLurkingReplies: [
			'@{name}, you\'re trying to lurk again? We thought you were already in the shadows! Did you forget to bring snacks?',
			'Wait, @{name}, you\'re still here? And trying to lurk? Get lost! (Just kidding... mostly).',
			'@{name} is attempting to lurk... *again*. Didn\'t you already have your vanishing act? Go on, shoo!',
			'Are you new to this, @{name}? You\'re already lurking! The \'disappear\' button only works once. Now scram!',
			'Uh, @{name}? You just tried to lurk, but you\'ve been a ghost for ages. Did you briefly consider rejoining chat?',
			'@{name}, you can\'t lurk if you\'re already successfully lurking. Get back to your silent duties!',
			'Is this a joke, @{name}? You\'re already lurking. Don\'t make me send you to the *super* lurk zone.',
			'Someone tell @{name} the lurk command isn\'t a continuous loop. We already wrote you off! (In a loving way, of course).',
			'@{name} is trying to double-lurk. Impressive, but unnecessary. You\'re already invisible to us!',
			'Ah, @{name}, back for round two of lurking? You never truly left our hearts... or our \'currently lurking\' list.',
		],
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		try {
			if (command.storage.lurkers.value.includes(message.userInfo.userName)) {
				const randomMessageTemplate = command.storage.alreadyLurkingReplies[Math.floor(Math.random() * command.storage.alreadyLurkingReplies.length)];
				const text = replaceTemplatePlaceholders(randomMessageTemplate, message);
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
				return;
			}

			command.storage.lurkers.value = [...command.storage.lurkers.value, message.userInfo.userName];

			const randomMessageTemplate = command.storage.snarkyLurkReplies[Math.floor(Math.random() * command.storage.snarkyLurkReplies.length)];
			const text = replaceTemplatePlaceholders(randomMessageTemplate, message);
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
		catch (error) {
			console.error('Error in lurk command:', error);
			const text = `This is the lurk command`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default command;
