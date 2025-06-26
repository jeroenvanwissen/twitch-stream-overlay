import SocketClient from './SocketClient';
import { castSocketInstance, setCastSocketInstance, setSocketInstance, socketInstance } from '@/store/socket';

export async function initializeSocket(url: string, accessToken: string): Promise<void> {
	socketInstance.value?.dispose?.();

	const socket = new SocketClient(url, accessToken);
	await socket.setup();
	setSocketInstance(socket);
}

export async function initializeCastSocket(url: string, accessToken: string): Promise<void> {
	castSocketInstance.value?.dispose?.();

	const socket = new SocketClient(url, accessToken, 'castHub');
	await socket.setup();
	setCastSocketInstance(socket);
}
