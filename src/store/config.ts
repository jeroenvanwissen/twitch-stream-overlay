import { ref, type VNodeRef, watch } from 'vue';
import type { HelixUser } from '@twurple/api';
import {useLocalStorage} from "@vueuse/core";

export const badgeTransitionDuration = ref(2);
export const badgeOpenDuration = ref(10);
export const badgeClosedDuration = ref(10);

export const chatShowDuration = ref(30);
export const chatAnimationDuration = ref(0.75);

export const latestSubscriber = ref<HelixUser>();
export const latestFollower = ref<HelixUser>();

export const textQueue: string[] = [];

// add whitespace to not underflow the text
export const texts = useLocalStorage('texts',JSON.parse(import.meta.env.VITE_BADGE_TEXTS) as string[]);

export const extension = ref<VNodeRef>();
export const badge = ref<VNodeRef>();
export const span = ref<VNodeRef>();

export let intercept = false;
export let interval: NodeJS.Timeout;
export let index = -1;

export const sleep = (duration: number) => {
  return new Promise(resolve => setTimeout(resolve, duration * 1000));
};

export const toggle = async () => {
  if (!extension.value || !badge.value || !span.value) return;

  setTimeout(() => {
    (extension.value as unknown as HTMLDivElement)!.classList.add('active');
  }, 800);

  (badge.value as unknown as HTMLDivElement).classList.toggle('active');

  await sleep(badgeTransitionDuration.value);
};

export const open = async () => {
  if (!extension.value || !badge.value || !span.value) return;

  const width = window.getComputedStyle(span.value as unknown as HTMLDivElement).width;
  (extension.value as unknown as HTMLDivElement).style.setProperty('--card-width', `calc(${width})`);

  setTimeout(() => {
    (extension.value as unknown as HTMLDivElement)!.classList.add('active');
  }, 800);

  (badge.value as unknown as HTMLDivElement).classList.add('active');

  await sleep(badgeTransitionDuration.value);
};

export const close = async (skip = false): Promise<void> => {
  if (!extension.value || !badge.value || !span.value) return;

  return new Promise((resolve, reject): void => {
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
};

export const cycle = async () => {
  if (!extension.value || !badge.value || !span.value) return;

  index += 1;

  (span.value as unknown as HTMLSpanElement).innerText = texts.value[index % texts.value.length]!;

  await open();
  await sleep(badgeOpenDuration.value);
  await close();
};

export const roulette = async () => {
  interval = setInterval(
    async () => {
      await cycle();
    },
    (badgeOpenDuration.value + badgeClosedDuration.value) * 1000 + badgeTransitionDuration.value * 1000 * 2,
  );

  await cycle();
};

export const processQueue = async () => {
  if (!extension.value || !badge.value || !span.value) return;

  // return to normal rotation when empty
  if (textQueue.length === 0 || intercept) {
    await sleep(badgeClosedDuration.value);
    await roulette();
    return;
  }

  intercept = true;

  clearInterval(interval);

  await close(intercept);

  (span.value as unknown as HTMLSpanElement).innerText = textQueue.shift()!;

  await open();
  await sleep(badgeOpenDuration.value);

  intercept = false;

  await close(intercept);

  await processQueue();
};

export const messageNow = async (text: string) => {
  textQueue.push(text);
  // if we are not already busy with the queue
  if (!intercept) {
    await processQueue();
  }
};

watch(extension, async value => {
  if (!value || !badge.value || !extension.value || !span.value) return;

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
