import { setVisibility } from "@/store/visibility";
import { ref } from "vue";

interface WebSocketWithDispatch extends WebSocket {
  on?: (event: string, callback: Function) => void;
  off?: (event: string, callback: Function) => void;
}

export const connect = (socket?: WebSocketWithDispatch | null) => {
  if (!socket) return;

  // Add event listeners for WebSocket
  socket.addEventListener("open", () => onConnect(socket));
  socket.addEventListener("close", () => onDisconnect(socket));
  socket.addEventListener("toggleComponent", (e: any) => {
    const { componentName, visible } = e.detail;
    onToggleComponent(componentName, visible);
  });

  socket.addEventListener("setComponentVisibility", (e: any) => {
    const { componentName, visible } = e.detail;
    onToggleComponent(componentName, visible);
  });

  // Maintain compatibility with old code that might use .on
  socket.on = (event: string, callback: Function) => {
    socket.addEventListener(event, (e: any) => callback(e.detail));
  };

  socket.off = (event: string, callback: Function) => {
    socket.removeEventListener(event, (e: any) => callback(e.detail));
  };
};

export const disconnect = (socket?: WebSocketWithDispatch | null) => {
  if (!socket) return;
  socket.close();
};

const timeout = ref<NodeJS.Timeout>();

export const onConnect = (socket?: WebSocketWithDispatch | null) => {
  if (!socket) return;
  document.dispatchEvent(new Event("baseHub-connected"));
  clearTimeout(timeout.value);
};

export const onDisconnect = (socket?: WebSocketWithDispatch | null) => {
  if (!socket) return;
  document.dispatchEvent(new Event("baseHub-disconnected"));
};

export const onToggleComponent = (componentName: string, visible: boolean) => {
  console.log(`Toggling component visibility: ${componentName} -> ${visible}`);
  setVisibility(componentName.toLowerCase(), visible);
};
