// src/hooks/useSocket.ts

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { SocketManager, type SocketNamespaceType } from "../utils/socket";
import { useAuthStore } from "../stores/authStore";

/**
 * Base hook for socket connection management
 */
export const useSocket = (namespace: SocketNamespaceType) => {
  const socketRef = useRef<Socket | null>(null);
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      // Disconnect if not logged in
      if (socketRef.current) {
        SocketManager.disconnectSocket(namespace);
        socketRef.current = null;
      }
      return;
    }

    // Get or create socket connection
    socketRef.current = SocketManager.getSocket(namespace);

    return () => {
      // Don't disconnect here - let SocketManager handle the lifecycle
      // Only disconnect when component unmounts or user logs out
    };
  }, [namespace, isLoggedIn, user]);

  return socketRef.current;
};
