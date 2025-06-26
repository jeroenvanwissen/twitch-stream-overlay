import { useLocalStorage } from '@vueuse/core';

export const spotifyVisible = useLocalStorage<boolean>('spotify-visibility', true);

const visibilityMap = {
	spotify: spotifyVisible,
} as const;

export type ComponentKey = keyof typeof visibilityMap;

export function setVisibility(component: ComponentKey, visible?: boolean): void {
	const storageRef = visibilityMap[component];
	// if `visible` is undefined, toggle; otherwise set to that value
	storageRef.value = visible ?? !storageRef.value;
}
