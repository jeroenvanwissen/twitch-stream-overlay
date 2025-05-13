import SocketClient from '@/lib/socketClient/SocketClient'
import { computed, ref, toRaw } from 'vue'

interface WebSocketWithDispatch extends WebSocket {
  on?: (event: string, callback: Function) => void
  off?: (event: string, callback: Function) => void
}

const si = ref<SocketClient>(<SocketClient>{})
export const socketInstance = computed(() => si.value)
export const setSocketInstance = (value: SocketClient) => {
  si.value = value
}

export const useSocket = () => {
  return toRaw(si.value.connection) as WebSocketWithDispatch
}

const castSi = ref<SocketClient>(<SocketClient>{})
export const castSocketInstance = computed(() => castSi.value)
export const setCastSocketInstance = (value: SocketClient) => {
  castSi.value = value
}

export const useCastSocket = () => {
  return toRaw(castSi.value.connection) as WebSocketWithDispatch
}
