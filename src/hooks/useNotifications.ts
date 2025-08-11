// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import envConfig from "../envConfig";
import { notificationApi } from "../api/notification.api";
import type { Notification } from "../models/notification.model";
import { useAuthStore } from "../stores/authStore";
import { getSocketConfig } from "../utils/socket";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, user } = useAuthStore();

  // Khởi tạo socket connection
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const newSocket = io(`${envConfig.VITE_API_END_POINT}/notification`, {
      ...getSocketConfig(),
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification socket");
    });

    newSocket.on("newNotification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setHasUnread(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification socket");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, user]);

  // Load notifications từ API
  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);

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

  // Load notifications khi component mount
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
    } else {
      setNotifications([]);
      setHasUnread(false);
    }
  }, [isLoggedIn, loadNotifications]);

  return {
    notifications,
    hasUnread,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};
