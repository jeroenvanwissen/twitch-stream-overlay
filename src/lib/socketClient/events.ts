import { ref } from 'vue';
import type { HubConnection } from '@microsoft/signalr';

export function connect(socket?: HubConnection) {
	if (!socket)
		return;

	socket.on('connect', onConnect);
	socket.on('disconnected', onDisconnect);
}

export function disconnect(socket?: HubConnection) {
	if (!socket)
		return;
	socket.off('connect', onConnect);
	socket.off('disconnected', onDisconnect);
}

const timeout = ref<NodeJS.Timeout>();

export function onConnect(socket?: HubConnection | null) {
	if (!socket)
		return;
	document.dispatchEvent(new Event('baseHub-connected'));
	clearTimeout(timeout.value);
}

export function onDisconnect(socket?: HubConnection | null) {
	if (!socket)
		return;
	document.dispatchEvent(new Event('baseHub-disconnected'));
}
