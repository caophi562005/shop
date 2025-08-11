// src/components/NotificationModal.tsx

import React from "react";
import type { Notification } from "../models/notification.model";
import "../assets/css/notificationModal.css";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Thông báo {unreadCount > 0 && `(${unreadCount} chưa đọc)`}</h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={onMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className="notification-content">
          {loading ? (
            <div className="notification-loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <i className="fa-solid fa-bell-slash"></i>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.readAt ? "unread" : "read"
                  }`}
                  onClick={() =>
                    !notification.readAt && onMarkAsRead(notification.id)
                  }
                >
                  <div className="notification-content-text">
                    {!notification.readAt && (
                      <div className="unread-indicator"></div>
                    )}
                    <p>{notification.content}</p>
                  </div>
                  <div className="notification-time">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
