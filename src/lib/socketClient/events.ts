import { usePomodoroStore } from '@/store/pomodoro';
import { setVisibility } from '@/store/visibility';
import type { ComponentKey } from '@/store/visibility';
import { ref } from 'vue';

interface WebSocketWithDispatch extends WebSocket {
	on?: (event: string, callback: Function) => void;
	off?: (event: string, callback: Function) => void;
}

export function connect(socket?: WebSocketWithDispatch | null) {
	if (!socket)
		return;

	// Add event listeners for WebSocket
	socket.addEventListener('open', () => onConnect(socket));
	socket.addEventListener('close', () => onDisconnect(socket));

	socket.addEventListener('toggleComponent', (e: any) => {
		const { componentName, visible } = e.detail;
		onToggleComponent(componentName, visible);
	});

	// This event can be used to trigger visibility on OBS scene changes via automation
	socket.addEventListener('setComponentVisibility', (e: any) => {
		const { componentName, visible } = e.detail;
		onToggleComponent(componentName, visible);
	});

	//   socket.addEventListener('addBadgeText', (e: any) => {
	//     const { text } = e.detail
	//     onAddBadgeText(text)
	//   })

	socket.addEventListener('pomodoro', (e: any) => {
		const { action } = e.detail;
		const pomodoroStore = usePomodoroStore();

		switch (action) {
			case 'start':
				pomodoroStore.start();
				break;
			case 'stop':
				pomodoroStore.stop();
				break;
			case 'reset':
				pomodoroStore.reset();
				break;
			default:
				console.warn('Unknown pomodoro action:', action);
		}
	});

	// Maintain compatibility with old code that might use .on
	socket.on = (event: string, callback: Function) => {
		socket.addEventListener(event, (e: any) => callback(e.detail));
	};

	socket.off = (event: string, callback: Function) => {
		socket.removeEventListener(event, (e: any) => callback(e.detail));
	};
}

export function disconnect(socket?: WebSocketWithDispatch | null) {
	if (!socket)
		return;
	socket.close();
}

const timeout = ref<NodeJS.Timeout>();

export function onConnect(socket?: WebSocketWithDispatch | null) {
	if (!socket)
		return;
	document.dispatchEvent(new Event('baseHub-connected'));
	clearTimeout(timeout.value);
}

export function onDisconnect(socket?: WebSocketWithDispatch | null) {
	if (!socket)
		return;
	document.dispatchEvent(new Event('baseHub-disconnected'));
}

export function onToggleComponent(componentName: string, visible: boolean) {
	setVisibility(componentName.toLowerCase() as ComponentKey, visible);
}
