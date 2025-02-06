import {computed, ref, toRaw} from 'vue';

import SocketClient from '@/lib/socketClient/SocketClient';
import {HubConnection} from '@microsoft/signalr';

const si = ref<SocketClient>(<SocketClient>{});
export const socketInstance = computed(() => si.value);
export const setSocketInstance = (value: SocketClient) => {
	si.value = value;
}

export const useSocket = () => {
	return toRaw(si.value.connection) as HubConnection
};

const castSi = ref<SocketClient>(<SocketClient>{});
export const castSocketInstance = computed(() => castSi.value);
export const setCastSocketInstance = (value: SocketClient) => {
	castSi.value = value;
}

export const useCastSocket = () => {
	return toRaw(castSi.value.connection) as HubConnection
};
