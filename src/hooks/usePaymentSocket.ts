// src/hooks/usePaymentSocket.ts

import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { SocketNamespace, generateRoomPaymentId } from "../utils/socket";

/**
 * Hook for payment socket functionality
 */
export const usePaymentSocket = (paymentId?: number) => {
  const socket = useSocket(SocketNamespace.PAYMENT);

  const joinPaymentRoom = useCallback(
    (id: number) => {
      if (!socket) return;

      const room = generateRoomPaymentId(id);
      socket.emit("joinPaymentRoom", id);

      console.log(`Joined payment room: ${room}`);
    },
    [socket]
  );

  const leavePaymentRoom = useCallback(
    (id: number) => {
      if (!socket) return;

      socket.emit("leavePaymentRoom", id);

      console.log(`Left payment room for payment: ${id}`);
    },
    [socket]
  );

  const onPaymentSuccess = useCallback(
    (callback: (paymentId: number) => void) => {
      if (!socket) return () => {};

      socket.on("successPaymentId", callback);

      return () => {
        socket.off("successPaymentId", callback);
      };
    },
    [socket]
  );

  // Auto join/leave room when paymentId changes
  useEffect(() => {
    if (!socket || !paymentId) return;

    joinPaymentRoom(paymentId);

    return () => {
      leavePaymentRoom(paymentId);
    };
  }, [socket, paymentId, joinPaymentRoom, leavePaymentRoom]);

  return {
    socket,
    joinPaymentRoom,
    leavePaymentRoom,
    onPaymentSuccess,
    isConnected: socket?.connected || false,
  };
};
