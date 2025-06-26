import { computed, ref, toRaw } from 'vue';

import type SocketClient from '@/lib/socketClient/SocketClient';
import type { HubConnection } from '@microsoft/signalr';

const si = ref<SocketClient>(<SocketClient>{});
export const socketInstance = computed(() => si.value);
export function setSocketInstance(value: SocketClient) {
	si.value = value;
}

export function useSocket() {
	return toRaw(si.value.connection) as HubConnection;
}

const castSi = ref<SocketClient>(<SocketClient>{});
export const castSocketInstance = computed(() => castSi.value);
export function setCastSocketInstance(value: SocketClient) {
	castSi.value = value;
}

export function useCastSocket() {
	return toRaw(castSi.value.connection) as HubConnection;
}
