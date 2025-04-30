import { HubConnection } from "@microsoft/signalr";
import { ref } from "vue";

export const connect = (socket?: HubConnection) => {
  if (!socket) return;

  socket.on("connect", onConnect);
  socket.on("disconnected", onDisconnect);
};

export const disconnect = (socket?: HubConnection) => {
  if (!socket) return;
  socket.off("connect", onConnect);
  socket.off("disconnected", onDisconnect);
};

const timeout = ref<NodeJS.Timeout>();

export const onConnect = (socket?: HubConnection | null) => {
  if (!socket) return;
  document.dispatchEvent(new Event("baseHub-connected"));
  clearTimeout(timeout.value);
};

export const onDisconnect = (socket?: HubConnection | null) => {
  if (!socket) return;
  document.dispatchEvent(new Event("baseHub-disconnected"));
};
