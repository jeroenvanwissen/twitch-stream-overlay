import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';

export interface DropStats {
	userName: string;
	displayName: string;
	attempts: number;
	landed: number;
	totalPoints: number;
	best: number;
	lastUpdated: string;
}

export const dropScores = useLocalStorage<DropStats[]>('drop-game-scores', []);

function migrateLegacyScores() {
	dropScores.value = dropScores.value.map((entry: any) => {
		if ('totalPoints' in entry)
			return entry as DropStats;

		const fallbackPoints = Number.isFinite(entry?.points) ? entry.points : 0;
		return {
			userName: entry?.userName?.toLowerCase?.() ?? '',
			displayName: entry?.displayName ?? entry?.userName ?? '',
			attempts: fallbackPoints > 0 ? 1 : 0,
			landed: fallbackPoints > 0 ? 1 : 0,
			totalPoints: fallbackPoints,
			best: fallbackPoints,
			lastUpdated: entry?.lastUpdated ?? new Date().toISOString(),
		} satisfies DropStats;
	});
}

migrateLegacyScores();

export const sortedDropScores = computed(() => {
	return [...dropScores.value].sort((a, b) => {
		if (b.totalPoints === a.totalPoints) {
			return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
		}

		return b.totalPoints - a.totalPoints;
	});
});

export function recordDropAttempt(entry: { userName: string; displayName?: string }) {
	const normalizedName = entry.userName.toLowerCase();
	const existing = dropScores.value.find(score => score.userName === normalizedName);
	const baseDisplayName = entry.displayName ?? existing?.displayName ?? entry.userName;

	const updated: DropStats = {
		userName: normalizedName,
		displayName: baseDisplayName,
		attempts: (existing?.attempts ?? 0) + 1,
		landed: existing?.landed ?? 0,
		totalPoints: existing?.totalPoints ?? 0,
		best: existing?.best ?? 0,
		lastUpdated: new Date().toISOString(),
	};

	dropScores.value = [
		...dropScores.value.filter(score => score.userName !== normalizedName),
		updated,
	];
}

export function recordDropLanding(entry: { userName: string; displayName?: string; points: number }) {
	const normalizedName = entry.userName.toLowerCase();
	const pointsToAdd = Number.isFinite(entry.points) ? entry.points : 0;

	const existing = dropScores.value.find(score => score.userName === normalizedName);
	const baseDisplayName = entry.displayName ?? existing?.displayName ?? entry.userName;

	const landedCount = (existing?.landed ?? 0) + 1;
	const attemptsCount = existing?.attempts && existing.attempts > 0 ? existing.attempts : landedCount;
	const updated: DropStats = {
		userName: normalizedName,
		displayName: baseDisplayName,
		attempts: attemptsCount,
		landed: landedCount,
		totalPoints: (existing?.totalPoints ?? 0) + pointsToAdd,
		best: Math.max(existing?.best ?? 0, pointsToAdd),
		lastUpdated: new Date().toISOString(),
	};

	dropScores.value = [
		...dropScores.value.filter(score => score.userName !== normalizedName),
		updated,
	];
}

export function getDropStats(userName: string): DropStats | undefined {
	const normalizedName = userName.toLowerCase();
	return dropScores.value.find(score => score.userName === normalizedName);
}

export function resetDropScores() {
	dropScores.value = [];
}

export function getHighestSingleDrop(): DropStats | undefined {
	return dropScores.value.reduce<DropStats | undefined>((acc, entry) => {
		if (!acc)
			return entry;
		if (entry.best > acc.best)
			return entry;
		if (entry.best === acc.best) {
			const entryTime = new Date(entry.lastUpdated).getTime();
			const accTime = new Date(acc.lastUpdated).getTime();
			return entryTime > accTime ? entry : acc;
		}
		return acc;
	}, undefined);
}
