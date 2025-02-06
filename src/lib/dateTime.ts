import {pad} from "@/lib/stringArray";

export const humanTime = function(time: any) {
	time = parseInt(time, 10);
	let hours: any = pad(parseInt(`${(time % 86400) / 3600}`, 10), 2);

	let minutes: any = parseInt(`${(time % 3600) / 60}`, 10);
	let seconds: any = parseInt(`${time % 60}`, 10);
	if (`${minutes}`.length === 1) {
		minutes = `0${minutes}`;
	}
	if (`${seconds}`.length === 1) {
		seconds = `0${seconds}`;
	}
	if (hours === 0) {
		hours = '00:';
	} else {
		hours = `${hours}:`;
	}
	if (minutes === 0) {
		minutes = '00:';
	} else {
		minutes = `${minutes}:`;
	}
	if (hours == '00:') {
		hours = '';
	}
	const current = hours + minutes + seconds;
	return current.replace('NaN:NaN:NaN', '00:00');
};

export const secondsToDuration = (seconds: number) => {
    const years = Math.floor(seconds / (365.25 * 24 * 3600));
    const months = Math.floor((seconds % (365.25 * 24 * 3600)) / (30.44 * 24 * 3600));
    const days = Math.floor((seconds % (30.44 * 24 * 3600)) / (24 * 3600));

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    return parts.join(' ');
}

export const monthsToSeconds = (months: string) => {
	return parseInt(months, 10) * 30.44 * 24 * 3600;
}