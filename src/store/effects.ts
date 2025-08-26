import { ref } from 'vue';

export const danceVisible = ref(false);

let hideTimer: number | null = null;

export function triggerDance(duration = 20000) {
	if (danceVisible.value)
		return; // prevent spam overlap
	danceVisible.value = true;
	if (hideTimer) {
		clearTimeout(hideTimer);
		hideTimer = null;
	}
	hideTimer = window.setTimeout(() => {
		danceVisible.value = false;
		hideTimer = null;
	}, duration);
}
