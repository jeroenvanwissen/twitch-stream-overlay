import { createApp } from 'vue';
import App from './App.vue';
import { initializeSocket } from './lib/socketClient/initializeSocket';
import './styles/index.scss';

const app = createApp(App);

const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
const wsToken = import.meta.env.VITE_WEBSOCKET_AUTH_TOKEN;

if (wsUrl && wsToken) {
	initializeSocket(wsUrl, wsToken).catch(console.error);
}
// Object.entries(localStorage).forEach(([key, val]) => {
// 	if (key.includes('spotify')) {
// 		localStorage.removeItem(key);
// 	}
// });

app.mount('#app');
