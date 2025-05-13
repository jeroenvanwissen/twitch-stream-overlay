import { setSocketInstance, socketInstance } from '@/store/socket'
import SocketClient from './SocketClient'

export const initializeSocket = async (url: string, accessToken: string): Promise<void> => {
  socketInstance.value?.dispose?.()

  const socket = new SocketClient(url, accessToken)
  await socket.setup()
  setSocketInstance(socket)
}
