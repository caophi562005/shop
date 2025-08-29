// src/models/notification.model.ts

export interface Notification {
  id: number;
  userId: number;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotification {
  userId: number;
  content: string;
}
