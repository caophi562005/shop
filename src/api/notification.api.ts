// src/api/notification.api.ts

import http from "./http";
import type { Notification } from "../models/notification.model";

export const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications: async (): Promise<Notification[]> => {
    const response = await http.get("/notifications");
    return response.data;
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (id: number): Promise<void> => {
    await http.patch(`/notifications/${id}/read`);
  },
};
