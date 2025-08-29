// src/hooks/useProductSocket.ts

import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { SocketNamespace, generateRoomProductId } from "../utils/socket";

export type GetProductDetailResType = {
  id: number;
  name: string;
  description: string;
  price: number;
  // Add other product properties as needed
};

/**
 * Hook for product socket functionality
 */
export const useProductSocket = (productId?: number) => {
  const socket = useSocket(SocketNamespace.PRODUCT);

  const joinProductRoom = useCallback(
    (id: number) => {
      if (!socket) return;

      const room = generateRoomProductId(id);
      socket.emit("joinProductRoom", id);

      console.log(`Joined product room: ${room}`);
    },
    [socket]
  );

  const leaveProductRoom = useCallback(
    (id: number) => {
      if (!socket) return;

      socket.emit("leaveProductRoom", id);

      console.log(`Left product room for product: ${id}`);
    },
    [socket]
  );

  const onProductUpdated = useCallback(
    (callback: (product: GetProductDetailResType) => void) => {
      if (!socket) return () => {};

      socket.on("productUpdated", callback);

      return () => {
        socket.off("productUpdated", callback);
      };
    },
    [socket]
  );

  const onProductDeleted = useCallback(
    (callback: () => void) => {
      if (!socket) return () => {};

      socket.on("productDeleted", callback);

      return () => {
        socket.off("productDeleted", callback);
      };
    },
    [socket]
  );

  // Auto join/leave room when productId changes
  useEffect(() => {
    if (!socket || !productId) return;

    joinProductRoom(productId);

    return () => {
      leaveProductRoom(productId);
    };
  }, [socket, productId, joinProductRoom, leaveProductRoom]);

  return {
    socket,
    joinProductRoom,
    leaveProductRoom,
    onProductUpdated,
    onProductDeleted,
    isConnected: socket?.connected || false,
  };
};
