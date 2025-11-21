import type { Message } from '@/types/chat';
import { recordDropAttempt, recordDropLanding } from '@/store/dropGame';

const DROP_RESULT_REGEX = /^"?(\S+)\s+landed\s+for\s+(\d+(?:\.\d+)?)!"?$/i;

export function handleDropAttemptMessage(message: Message): boolean {
	const cmd = message.plainText.trim().toLowerCase();
	// Match bare `!drop` or `!drop` followed by space/non-alphanumeric (emotes), but not other !drop* commands.
	if (!/^!drop($|[^a-z0-9])/i.test(cmd))
		return false;

	recordDropAttempt({
		userName: message.userInfo.userName,
		displayName: message.userInfo.displayName,
	});

	return true;
}

export function handleDropResultMessage(message: Message): boolean {
	if (!message.userInfo.isBroadcaster)
		return false;

	const match = message.plainText.trim().match(DROP_RESULT_REGEX);
	console.log('handleDropResultMessage', message.plainText, match);
	if (!match)
		return false;

	const [, rawUserName, rawPoints] = match;
	const points = Number.parseInt(rawPoints, 10);
	if (Number.isNaN(points))
		return false;

	recordDropLanding({
		userName: rawUserName,
		displayName: rawUserName,
		points,
	});

	return true;
}
