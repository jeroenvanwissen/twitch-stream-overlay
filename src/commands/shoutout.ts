import type { Command } from '@/types/chat';

import chatClient from '@/lib/twitch/chatClient';
import { announce, apiClient, getUserIdFromName, shoutoutUser } from '@/lib/twitch/apiClient';
import { replaceTemplatePlaceholders } from '@/lib/utils';
import { getUserData } from '@/lib/twitch/getUserData';

interface ShoutoutStorage {
	template: string;
	snarkyShoutoutReplies: string[];
}

const command: Command<ShoutoutStorage> = {
	name: 'so',
	permission: 'moderator',
	type: 'command',
	storage: {
		template: 'Check out @{name}! {subject} {tense} streaming {game}. Go give {object} a follow!',
		snarkyShoutoutReplies: [
			'Check out @{displayname}! {Subject} has some great {game} content. Go give {object} a follow! {Subject} {tense} practically a pro, or at least {Subject} plays one on Twitch.',
			'Yo, peep this! @{displayname} {tense} rocking some {game} stuff. Go give {object} a follow! {Subject} {tense} so good, it\'s almost annoying.',
			'Attention, earthlings! @{displayname} has {game} videos you need to see. Go give {object} a follow! {Subject} {tense} probably putting on a masterclass, or a clown show – either way, it\'s entertaining.',
			'Incoming awesome! @{displayname} has some {game} action for you. Go give {object} a follow! {Subject} {tense} crushing it, or at least {Subject} looks like {Subject} is.',
			'Don\'t walk, run! @{displayname} has more {game} than you can handle. Go give {object} a follow! {Subject} {tense} definitely worth interrupting your snack for.',
			// 'Surprise! @{displayname} has tons of {game} content. Go give {object} a follow! {Subject} {tense} making us all look bad with {object} skills (or lack thereof, it\'s charming!).',
			'Our resident legend, @{displayname}, has awesome {game}! Go give {object} a follow! {Subject} {tense} probably about to pull off something epic, or face-plant gloriously.',
			'Heads up, buttercups! @{displayname} has some {game} for you. Go give {object} a follow! {Subject} {tense} proving once again that {Subject} {tense} awesome (don\'t tell {object} I said that).',
			'Guess who\'s got content? @{displayname}! {Subject} {tense} rocking {game}. Go give {object} a follow! {Subject} {tense} bringing the vibes, whether {Subject} likes it or not.',
			'Behold! @{displayname} has some solid {game} for you. Go give {object} a follow! {Subject} {tense} gracing us with {object} presence and questionable decision-making in {game}.',
		],
	},
	init: () => {},
	callback: async ({ channel, broadcasterId, params, message }) => {
		if (params!.length === 0) {
			await chatClient.say(channel, `@${message.userInfo.displayName} You need to specify a user to shoutout!`);
			return;
		}

		const name = params.at(0)!.replace('@', '');
		const userId = await getUserIdFromName(name);
		const userData = (await getUserData(channel, userId))!;

		message.userInfo = {
			...message.userInfo,
			avatarUrl: userData.profile_image_url,
			displayName: userData.display_name,
			id: userData.user_id,
			userId: userData.user_id,
			userName: userData.display_name,
			pronoun: userData.pronoun,
		};

		const channelInfo = await apiClient.channels.getChannelInfoById(userId);
		const isLive = await apiClient.streams.getStreamByUserId(userId) !== null;

		const gameInfo = {
			gameName: channelInfo?.gameName,
			title: channelInfo?.title,
		};

		const randomMessageTemplate = command.storage.snarkyShoutoutReplies[Math.floor(Math.random() * command.storage.snarkyShoutoutReplies.length)];

		const text = replaceTemplatePlaceholders(
			randomMessageTemplate,
			message,
			isLive,
			gameInfo,
		);

		await announce(channel, text, 'primary');

		await shoutoutUser(broadcasterId!, userId!)
			.catch(async (e) => {
				// const error = JSON.parse(e.message.split('Body:')[1]);
				// await chatClient.say(channel, error.message);
			});
	},
};

export default command;
