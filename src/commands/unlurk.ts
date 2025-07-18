import { useLocalStorage } from '@vueuse/core';

import type { Command } from '@/types/chat';

import chatClient from '@/lib/twitch/chatClient';
import { replaceTemplatePlaceholders } from '@/lib/utils';
import type { Ref } from 'vue';

interface UnlurkStorage {
	lurkers: Ref<string[], string[]>;
	snarkyReplies: string[];
	notLurkingUnlurkReplies: string[];
}

const command: Command<UnlurkStorage> = {
	name: 'unlurk',
	permission: 'everyone',
	type: 'command',
	storage: {
		lurkers: useLocalStorage<string[]>('lurkers', []),
		snarkyReplies: [
			'Look alive, everyone! @{name} has emerged from the lurk zone. We almost forgot about you!',
			'Well, well, well, if it isn\'t @{name}, gracing us with their active presence once more. Did you miss us?',
			'The legend, @{name}, has returned! We\'ve been holding your pixelated seat. Don\'t touch anything, it\'s still warm.',
			'Breaking news: @{name} has successfully completed their top-secret lurker mission. Welcome back to the land of the living!',
			'@{name} has bravely decided to rejoin the chaos. We\'re shocked, honestly. What took you so long?',
			'Hark! Is that... chatter? It is! @{name} has officially unlurked. Your silence was deafening, just sayin\'.',
			'Welcome back, @{name}! We hope your lurking was productive. Now get to work, there\'s chat to be had!',
			'@{name} has resurfaced! Did you bring snacks from the shadows? No? Aw, well, welcome back anyway.',
			'The prophecy is true! @{name} has shed their lurker skin. Prepare for... well, whatever you do when you\'re not lurking.',
			'It\'s true, @{name} is no longer a ghost in the machine. Your keyboard must be so lonely no more. Welcome back!',
			'Hold the phone! @{name} has decided to grace us with their voice again. We thought you\'d joined a silent monastery!',
			'A wild @{name} appeared! {Subject} used !unlurk. It was super effective. Welcome back, we guess.',
			'Did anyone else hear that? Oh, it\'s just @{name} finally rejoining the chat. The lurk spell has been broken!',
			'Look what the cat dragged in! It\'s @{name}, back from the digital wilderness. Don\'t worry, we saved you some crumbs.',
			'Well, hello there, @{name}! Decided to abandon your lurking duties, have we? Good to see your pixels again.',
			'Our long-lost @{name} has returned! We were just about to send out a search party. What\'d you miss? Everything.',
			'The great @{name} has descended from the lurker heavens! Please, try not to blind us with your sudden presence.',
			'Confirmation: @{name} is no longer a ninja. Their !unlurk command exposed them! Welcome back to the light.',
			'Alert, alert! @{name} has been detected in active chat! The lurk epoch is over, for now.',
			'Just when we thought the silence was permanent, @{name} unlurks! Glad you found your way back to civilization.',
		],
		notLurkingUnlurkReplies: [
			'@{name}, you can\'t unlurk if you weren\'t even lurking! Were you trying to escape from something else?',
			'Did we miss something, @{name}? You just tried to unlurk, but we didn\'t even know you were gone. What\'s your secret?',
			'@{name} just used unlurk. My dude, you were never in the lurk zone to begin with! Are you okay?',
			'Hold on, @{name}. unlurk? Were you secretly lurking under a rock this whole time? We definitely saw you chatting!',
			'Is this a magic trick, @{name}? You can\'t unlurk from a state you weren\'t in! Stay hydrated, buddy.',
			'@{name} is trying to reverse lurk. Fascinating. But you haven\'t been lurking! Get back to your active chat duties!',
			'Uh, @{name}? Your unlurk command seems to have glitched. You\'ve been here the whole time! Try again when you actually vanish.',
			'Welcome back from... not lurking, @{name}! We\'re thrilled you\'re still here, even if your command is confused.',
			'@{name} just attempted an unlurk. Newsflash: You\'ve been chatting away! No escape for you!',
			'My systems indicate @{name} has always been here. No need to unlurk from the land of the actively chatting. What gives?',
		],
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		try {
			if (!command.storage.lurkers.value.includes(message.userInfo.userName)) {
				const randomMessageTemplate = command.storage.notLurkingUnlurkReplies[Math.floor(Math.random() * command.storage.notLurkingUnlurkReplies.length)];
				const text = replaceTemplatePlaceholders(randomMessageTemplate, message);
				await chatClient.say(channel, text);
				return;
			}

			command.storage.lurkers.value = command.storage.lurkers.value.filter(name => name !== message.userInfo.userName);

			const randomMessageTemplate = command.storage.snarkyReplies[Math.floor(Math.random() * command.storage.snarkyReplies.length)];
			const text = replaceTemplatePlaceholders(randomMessageTemplate, message);
			await chatClient.say(channel, text);
		}
		catch (error) {
			console.error('Error in lurk command:', error);
			await chatClient.say(channel, `@${message.userInfo.displayName} This is the lurk command`);
		}
	},
};

export default command;
