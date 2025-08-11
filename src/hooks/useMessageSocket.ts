// src/hooks/useMessageSocket.ts

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { SocketNamespace, generateRoomMessageUser } from "../utils/socket";
import { useAuthStore } from "../stores/authStore";

interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
}

/**
 * Hook for message socket functionality
 */
export const useMessageSocket = () => {
  const socket = useSocket(SocketNamespace.MESSAGE);
  const { user } = useAuthStore();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const joinMessageRoom = useCallback(
    (targetUserId: number) => {
      if (!socket || !user) return;

      const newRoom = generateRoomMessageUser(user.id, targetUserId);

      // Leave current room if exists
      if (currentRoom) {
        socket.emit("leaveMessageRoom", currentRoom);
      }

      // Join new room
      socket.emit("joinMessageRoom", newRoom);
      setCurrentRoom(newRoom);

      console.log(`Joined message room: ${newRoom}`);
    },
    [socket, user, currentRoom]
  );

  const leaveMessageRoom = useCallback(() => {
    if (!socket || !currentRoom) return;

    socket.emit("leaveMessageRoom", currentRoom);
    setCurrentRoom(null);

    console.log(`Left message room: ${currentRoom}`);
  }, [socket, currentRoom]);

  const sendMessage = useCallback(
    (toUserId: number, content: string) => {
      if (!socket || !user) return;

      socket.emit("send-message", {
        fromUserId: user.id,
        toUserId,
        content,
      });
    },
    [socket, user]
  );

  const onNewMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (!socket) return () => {};

      socket.on("newMessage", callback);

      return () => {
        socket.off("newMessage", callback);
      };
    },
    [socket]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMessageRoom();
    };
  }, [leaveMessageRoom]);

  return {
    socket,
    joinMessageRoom,
    leaveMessageRoom,
    sendMessage,
    onNewMessage,
    currentRoom,
    isConnected: socket?.connected || false,
  };
};
