import { ref } from 'vue';

export const videoBite = ref<string | null>(null);

export const blerpBaseUrl = 'https://pub-18c5e0157eac446791453eae967ba1a9.r2.dev';
export const blerps = {
	nomercy: '/nomercy.mp4',
};

export const video = ref<HTMLVideoElement | null>(null);
export const hasvideo = ref(false);
export async function playBlerp(blerp: keyof typeof blerps) {
	return await new Promise<void>((resolve, reject) => {
		if (!video.value) {
			resolve();
			return;
		}

		video.value.src = blerpBaseUrl + blerps[blerp];

		video.value.load();

		video.value.addEventListener('ended', () => {
			if (!video.value)
				return;
			video.value.removeAttribute('src');
			videoBite.value = null;
			hasvideo.value = false;
			resolve();
		});

		video.value.play()
			.then(() => hasvideo.value = true)
			.catch((err) => {
				console.error('Error playing video:', err);
				reject(err);
			});
	});
}
