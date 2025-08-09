import { ref, watch } from 'vue';
import type { VNodeRef } from 'vue';
import type { HelixUser } from '@twurple/api';
import { useLocalStorage } from '@vueuse/core';

export const badgeTransitionDuration = ref(2);
export const badgeOpenDuration = ref(10);
export const badgeClosedDuration = ref(10);

export const chatShowDuration = ref(30);
export const chatAnimationDuration = ref(0.75);

// Lists rotation configuration
export const listsShowDuration = ref(15); // Duration in seconds each list is shown
export const listsSwitchDelay = ref(60); // Delay in seconds between lists
export const listsAnimationDuration = ref(0.75); // Duration of animation in seconds

export const latestSubscriber = ref<HelixUser>();
export const latestFollower = ref<HelixUser>();

export const textQueue: string[] = [];

// add whitespace to not underflow the text
export const texts = useLocalStorage('texts', JSON.parse(import.meta.env.VITE_BADGE_TEXTS) as string[]);

export const extension = ref<VNodeRef>();
export const badge = ref<VNodeRef>();
export const span = ref<VNodeRef>();

export const welcomeUserAfterHours = ref(16); // after how many hours a user is welcome again
export const ignoredUsersForWelcome = useLocalStorage<string[]>('ignoredUsersForWelcome', [
	'streamelements',
	'fossabot',
	'nomercybot_',
	'codelinter',
]);

export const defaultColor = '#f72264';

let intercept = false;
let interval: NodeJS.Timeout;
let index = -1;

export function sleep(duration: number) {
	return new Promise(resolve => setTimeout(resolve, duration * 1000));
}

export async function toggle() {
	if (!extension.value || !badge.value || !span.value)
		return;

	setTimeout(() => {
		(extension.value as unknown as HTMLDivElement)!.classList.add('active');
	}, 800);

	(badge.value as unknown as HTMLDivElement).classList.toggle('active');

	await sleep(badgeTransitionDuration.value);
}

export async function open() {
	if (!extension.value || !badge.value || !span.value)
		return;

	const width = window.getComputedStyle(span.value as unknown as HTMLDivElement).width;
	(extension.value as unknown as HTMLDivElement).style.setProperty('--card-width', `calc(${width})`);

	setTimeout(() => {
		(extension.value as unknown as HTMLDivElement)!.classList.add('active');
	}, 800);

	(badge.value as unknown as HTMLDivElement).classList.add('active');

	await sleep(badgeTransitionDuration.value);
}

export async function close(skip = false): Promise<void> {
	if (!extension.value || !badge.value || !span.value)
		return;

	return new Promise((resolve): void => {
		// if we have a queue we need to bypass this exit when called from the queue
		// this prevents remaining timeouts from closing when we want it to stay open
		if (intercept && !skip) {
			return resolve();
		}

		setTimeout(() => {
			(extension.value as unknown as HTMLDivElement)!.classList.remove('active');
		}, 800);

		(badge.value as unknown as HTMLDivElement)!.classList.remove('active');

		setTimeout(() => {
			resolve();
		}, badgeTransitionDuration.value * 1000);
	});
}

export async function cycle() {
	if (!extension.value || !badge.value || !span.value)
		return;

	index += 1;

	(span.value as unknown as HTMLSpanElement).textContent = texts.value[index % texts.value.length]!;

	await open();
	await sleep(badgeOpenDuration.value);
	await close();
}

export async function roulette() {
	interval = setInterval(
		async () => {
			await cycle();
		},
		(badgeOpenDuration.value + badgeClosedDuration.value) * 1000 + badgeTransitionDuration.value * 1000 * 2,
	);

	await cycle();
}

export async function processQueue() {
	if (!extension.value || !badge.value || !span.value)
		return;

	// return to normal rotation when empty
	if (textQueue.length === 0 || intercept) {
		await sleep(badgeClosedDuration.value);
		await roulette();
		return;
	}

	intercept = true;

	clearInterval(interval);

	await close(intercept);

	(span.value as unknown as HTMLSpanElement).textContent = textQueue.shift()!;

	await open();
	await sleep(badgeOpenDuration.value);

	intercept = false;

	await close(intercept);

	await processQueue();
}

export async function messageNow(text: string) {
	textQueue.push(text);
	// if we are not already busy with the queue
	if (!intercept) {
		await processQueue();
	}
}

watch(extension, async (value) => {
	if (!value || !badge.value || !extension.value || !span.value)
		return;

	(value as unknown as HTMLDivElement).style.transitionDuration = `${badgeTransitionDuration.value * 1000}ms`;

	await roulette();
});

setInterval(
	() => {
		latestSubscriber.value && messageNow(`Latest subscriber: ${latestSubscriber.value.displayName}`);
		latestFollower.value && messageNow(`Latest follower: ${latestFollower.value?.displayName}`);
	},
	5 * 60 * 1000,
);
