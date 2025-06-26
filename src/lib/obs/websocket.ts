import OBSWebSocket from 'obs-websocket-js';

class OBSWebSocketClient {
	private obs: OBSWebSocket;
	private isConnected = false;

	constructor() {
		this.obs = new OBSWebSocket();
	}

	async connect(address = 'localhost:4455', password = '') {
		try {
			await this.obs.connect(address, password);
			this.isConnected = true;
			console.log('Connected to OBS WebSocket');
			this.setupListeners();
			return true;
		}
		catch (error) {
			console.error('Failed to connect to OBS WebSocket:', error);
			return false;
		}
	}

	private setupListeners() {
		this.obs.on('AuthenticationSuccess', () => {
			console.log('OBS WebSocket authenticated');
		});

		// Listen for custom messages that might contain auth data
		this.obs.on('CustomEvent', (data) => {
			if (data.eventType === 'auth_data') {
				this.handleAuthData(data.eventData);
			}
		});
	}

	private handleAuthData(data: any) {
		// Store received tokens in your app state
		if (data.twitchToken) {
			// Update twitch auth in your state management
		}
		if (data.spotifyToken) {
			// Update spotify auth in your state management
		}
	}

	// Method to check authentication status
	async sendAuthRequest() {
		if (!this.isConnected)
			return false;

		await this.obs.call('BroadcastCustomEvent', {
			eventData: { type: 'request_auth' },
		});
	}
}

export const obsWebSocketClient = new OBSWebSocketClient();
export default obsWebSocketClient;
