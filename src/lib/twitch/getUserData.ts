import apiClient from '@/lib/twitch/apiClient';
import type { HelixChatBadgeVersion, HelixUser } from '@twurple/api';
import { ref, toRaw } from 'vue';

export interface User {
	profile_image_url: string;
	display_name: string;
	user_id: string;
	is_host: boolean;
	date: number;
	pronoun: Pronoun | null;
	badges: HelixChatBadgeVersion[];
}

export interface Pronoun {
	name: string;
	subject: string;
	object: string;
	singular: boolean;
}

const users = new Map<string, User>();

const pronouns = ref<{ [key: string]: Pronoun }>(<{ [key: string]: Pronoun }>{});

(async () => {
	pronouns.value = await fetch('https://api.pronouns.alejo.io/v1/pronouns').then(res => res.json());
})();

export async function getUserData(channel: string, id: string) {
	const key = `${channel}-${id}`;
	if (users.has(key)) {
		const user = users.get(key);
		if (user && Date.now() - user.date < 15000)
			return user;
	}

	const userData: HelixUser | null = await apiClient.users.getUserById(id);

	if (!userData)
		return null;

	const pronoun = await fetch(`https://api.pronouns.alejo.io/v1/users/${userData.name}`)
		.then(res => res.json())
		.then((res) => {
			return toRaw(pronouns.value[res.pronoun_id]);
		})
		.catch(() => null);

	users.set(key, {
		profile_image_url: userData.profilePictureUrl,
		display_name: userData.displayName,
		user_id: userData.id,
		is_host: userData.id === id,
		date: new Date(Date.now()).getTime(),
		pronoun,
		badges: [],
	});

	return users.get(key);
}
