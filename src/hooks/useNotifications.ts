// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { SocketNamespace } from "../utils/socket";
import { notificationApi } from "../api/notification.api";
import type { Notification } from "../models/notification.model";
import { useAuthStore } from "../stores/authStore";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuthStore();

  // Use the centralized socket
  const socket = useSocket(SocketNamespace.NOTIFICATION);

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some(n => n.id === notification.id);
        if (exists) {
          console.log('Notification already exists, skipping duplicate:', notification.id);
          return prev;
        }
        
        // Add new notification to the beginning of the list
        return [notification, ...prev];
      });
      setHasUnread(true);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  // Load notifications từ API
  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      
      // Merge with existing notifications to prevent duplicates
      setNotifications((prev) => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = data.filter(n => !existingIds.has(n.id));
        
        // If we have existing notifications from socket, merge them
        if (prev.length > 0) {
          // Sort by createdAt to maintain order
          const merged = [...prev, ...newNotifications].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return merged;
        }
        
        // If no existing notifications, just use the API data
        return data;
      });

      // Check for unread notifications
      const hasUnreadNotifications = data.some(
        (notification) => !notification.readAt
      );
      setHasUnread(hasUnreadNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, readAt: new Date() }
            : notification
        )
      );

      // Update hasUnread status
      setNotifications((prev) => {
        const hasUnreadNotifications = prev.some(
          (notification) => !notification.readAt
        );
        setHasUnread(hasUnreadNotifications);
        return prev;
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter((n) => !n.readAt);

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          notificationApi.markAsRead(notification.id)
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          readAt: notification.readAt || new Date(),
        }))
      );

      setHasUnread(false);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [notifications]);

  // Load notifications khi component mount và khi login status thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setHasUnread(false);
    }
  }, [isLoggedIn]); // Remove loadNotifications dependency to prevent multiple calls

  return {
    notifications,
    hasUnread,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    isConnected: socket?.connected || false,
  };
};
