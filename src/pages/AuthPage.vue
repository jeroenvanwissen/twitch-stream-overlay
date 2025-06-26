<script setup lang="ts">
import { onMounted } from 'vue';
import OBSWebSocket from 'obs-websocket-js';
import { accessToken, clientId, spotifyAccessToken, spotifyClientId } from '@/store/auth';

const obs = new OBSWebSocket();

async function connectToOBS() {
	try {
		console.log('Connecting to OBS');
		await obs.connect(`ws://${obsAddress.value}`, obsPassword.value);
		isConnectedToOBS.value = true;
	}
	catch (error) {
		console.error('Failed to connect to OBS:', error);
		alert('Failed to connect to OBS WebSocket');
	}
}

async function authenticateTwitch() {
	const redirectUri = encodeURIComponent(`${window.location.origin}`);
	const scope = 'chat:read chat:edit';

	window.open(
		`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`,
		'twitch-auth',
		'width=600,height=800',
	);

	// You'd need to implement a listener for the callback
	window.addEventListener('message', (event) => {
		if (event.data.type === 'twitch-token') {
			accessToken.value = event.data.token;
			twitchAuthenticated.value = true;
		}
	});
}

async function authenticateSpotify() {
	const redirectUri = encodeURIComponent(`${window.location.origin}`);
	const scope = 'user-read-currently-playing user-read-playback-state';

	window.open(
		`https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`,
		'spotify-auth',
		'width=600,height=800',
	);

	// You'd need to implement a listener for the callback
	window.addEventListener('message', (event) => {
		if (event.data.type === 'spotify-token') {
			spotifyAccessToken.value = event.data.token;
			spotifyAuthenticated.value = true;
		}
	});
}

async function sendAuthToOverlay() {
	if (!isConnectedToOBS.value)
		return;

	try {
		await obs.call('BroadcastCustomEvent', {
			eventData: {
				type: 'auth_data',
				twitchToken: accessToken.value,
				spotifyToken: spotifyAccessToken.value,
			},
		});

		alert('Authentication data sent to overlay!');
	}
	catch (error) {
		console.error('Failed to send auth data:', error);
		alert('Failed to send authentication data to overlay');
	}
}

onMounted(() => {
	if (isConnectedToOBS.value) {
		connectToOBS();
	}
});
</script>

<template>
	<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
		<h1 class="text-2xl font-bold mb-8">
			Stream Overlay Authentication
		</h1>

		<div v-if="!connected" class="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
			<h2 class="text-xl mb-4">
				Connect to OBS
			</h2>
			<div class="mb-4">
				<input
					v-model="obsAddress"
					placeholder="OBS WebSocket Address (default: localhost:4455)"
					class="w-full p-2 mb-2 bg-gray-700 rounded border border-gray-600"
				>
				<input
					v-model="obsPassword"
					type="password"
					placeholder="OBS WebSocket Password (if required)"
					class="w-full p-2 bg-gray-700 rounded border border-gray-600"
				>
			</div>
			<button
				class="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
				@click="connectToOBS"
			>
				Connect to OBS
			</button>
		</div>

		<div v-else class="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
			<div class="mb-6">
				<p class="text-green-400 mb-4">
					✓ Connected to OBS WebSocket
				</p>

				<button
					class="w-full p-2 mb-3 rounded font-bold"
					:class="authStore.isAuthenticated.twitch ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'"
					@click="authenticateTwitch"
				>
					{{ authStore.isAuthenticated.twitch ? '✓ Twitch Connected' : 'Connect to Twitch' }}
				</button>

				<button
					class="w-full p-2 mb-6 rounded font-bold"
					:class="authStore.isAuthenticated.spotify ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'"
					@click="authenticateSpotify"
				>
					{{ authStore.isAuthenticated.spotify ? '✓ Spotify Connected' : 'Connect to Spotify' }}
				</button>

				<button
					class="w-full p-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold"
					:disabled="!authStore.isAuthenticated.twitch && !authStore.isAuthenticated.spotify"
					@click="sendAuthToOverlay"
				>
					Send Authentication to Overlay
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
