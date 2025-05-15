import { watch } from 'vue';

import SocketClient from './SocketClient';
import { setSocketInstance, socketInstance, castSocketInstance, setCastSocketInstance } from '@/store/socket';

export const initializeSocket = async (url: string, accessToken: string): Promise<void> => {
  socketInstance.value?.dispose?.();

  const socket = new SocketClient(url, accessToken);
  await socket.setup();
  setSocketInstance(socket);
};

export const initializeCastSocket = async (url: string, accessToken: string): Promise<void> => {
  castSocketInstance.value?.dispose?.();

  const socket = new SocketClient(url, accessToken, 'castHub');
  await socket.setup();
  setCastSocketInstance(socket);
};
