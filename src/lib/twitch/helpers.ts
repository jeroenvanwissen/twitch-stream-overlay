import type { Message } from '@/types/chat';

export const levels = ['broadcaster', 'moderator', 'vip', 'subscriber', 'everyone'];

export function hasMinLevel(userInfo: Message['userInfo'], minLevel: string) {
	if (userInfo.isBroadcaster)
		return true;
	if (minLevel === 'moderator' && userInfo.isMod)
		return true;
	if (minLevel === 'vip' && (userInfo.isMod || userInfo.isVip))
		return true;
	if (minLevel === 'subscriber' && (userInfo.isSubscriber || userInfo.isMod || userInfo.isVip))
		return true;
	if (minLevel === 'everyone')
		return true;
	return false;
}
