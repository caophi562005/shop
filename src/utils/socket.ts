import { io, Socket } from "socket.io-client";
import envConfig from "../envConfig";

// Room generators
export const generateRoomUserId = (userId: number) => {
  return `userId-${userId}`;
};

export const generateRoomProductId = (productId: number) => {
  return `productId-${productId}`;
};

export const generateRoomPaymentId = (paymentId: number) => {
  return `paymentId-${paymentId}`;
};

export const generateRoomMessageUser = (userId1: number, userId2: number) => {
  const sorted = [userId1, userId2].sort();
  return `message-${sorted[0]}-${sorted[1]}`;
};

// Socket config
export const getSocketConfig = () => ({
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
  timeout: 20000,
});

// Socket namespaces constants
export const SocketNamespace = {
  NOTIFICATION: "/notification",
  MESSAGE: "/message",
  PRODUCT: "/product",
  PAYMENT: "/payment",
} as const;

export type SocketNamespaceType =
  (typeof SocketNamespace)[keyof typeof SocketNamespace];

// Socket manager class
export class SocketManager {
  private static instances: Map<SocketNamespaceType, Socket> = new Map();

  static getSocket(namespace: SocketNamespaceType): Socket {
    const existing = this.instances.get(namespace);
    if (existing && existing.connected) {
      return existing;
    }

    const socket = io(
      `${envConfig.VITE_API_END_POINT}${namespace}`,
      getSocketConfig()
    );
    this.instances.set(namespace, socket);

    // Add global error handling
    socket.on("connect_error", (error) => {
      console.error(`Socket connection error for ${namespace}:`, error);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected from ${namespace}:`, reason);
    });

    return socket;
  }

  static disconnectSocket(namespace: SocketNamespaceType): void {
    const socket = this.instances.get(namespace);
    if (socket) {
      socket.disconnect();
      this.instances.delete(namespace);
    }
  }

  static disconnectAll(): void {
    this.instances.forEach((socket) => {
      socket.disconnect();
    });
    this.instances.clear();
  }

  static isConnected(namespace: SocketNamespaceType): boolean {
    const socket = this.instances.get(namespace);
    return socket ? socket.connected : false;
  }
}
