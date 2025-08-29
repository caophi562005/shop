// src/examples/SocketUsageExamples.tsx
// File này chứa ví dụ về cách sử dụng các socket hooks mới

import { useEffect } from "react";
import { useProductSocket } from "../hooks/useProductSocket";
import { usePaymentSocket } from "../hooks/usePaymentSocket";
import { useMessageSocket } from "../hooks/useMessageSocket";
import { useNotifications } from "../hooks/useNotifications";

// Example 1: Using Product Socket (for ProductDetailPage)
export const ProductDetailExample = ({ productId }: { productId: number }) => {
  const { onProductUpdated, onProductDeleted, isConnected } =
    useProductSocket(productId);

  useEffect(() => {
    // Lắng nghe sản phẩm được cập nhật
    const cleanupUpdated = onProductUpdated((updatedProduct) => {
      console.log("Product updated:", updatedProduct);
      // Update your product state here
    });

    // Lắng nghe sản phẩm bị xóa
    const cleanupDeleted = onProductDeleted(() => {
      console.log("Product deleted");
      // Navigate away or show message
    });

    return () => {
      cleanupUpdated();
      cleanupDeleted();
    };
  }, [onProductUpdated, onProductDeleted]);

  return (
    <div>
      <p>Socket connected: {isConnected ? "Yes" : "No"}</p>
      <p>Listening for updates on product: {productId}</p>
    </div>
  );
};

// Example 2: Using Payment Socket (for TransferPage)
export const PaymentExample = ({ paymentId }: { paymentId: number }) => {
  const { onPaymentSuccess, isConnected } = usePaymentSocket(paymentId);

  useEffect(() => {
    const cleanup = onPaymentSuccess((successPaymentId) => {
      console.log("Payment successful:", successPaymentId);
      // Handle payment success
    });

    return cleanup;
  }, [onPaymentSuccess]);

  return (
    <div>
      <p>Payment socket connected: {isConnected ? "Yes" : "No"}</p>
      <p>Waiting for payment: {paymentId}</p>
    </div>
  );
};

// Example 3: Using Message Socket (for Chat components)
export const ChatExample = ({ targetUserId }: { targetUserId: number }) => {
  const { sendMessage, onNewMessage, joinMessageRoom, isConnected } =
    useMessageSocket();

  useEffect(() => {
    // Join room with target user
    joinMessageRoom(targetUserId);

    // Listen for new messages
    const cleanup = onNewMessage((message) => {
      console.log("New message:", message);
      // Update your messages state
    });

    return cleanup;
  }, [targetUserId, joinMessageRoom, onNewMessage]);

  const handleSendMessage = () => {
    sendMessage(targetUserId, "Hello from new socket system!");
  };

  return (
    <div>
      <p>Chat socket connected: {isConnected ? "Yes" : "No"}</p>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};

// Example 4: Using Notifications (for Header or anywhere)
export const NotificationExample = () => {
  const { notifications, hasUnread, markAsRead, markAllAsRead, isConnected } =
    useNotifications();

  return (
    <div>
      <p>Notification socket connected: {isConnected ? "Yes" : "No"}</p>
      <p>Has unread: {hasUnread ? "Yes" : "No"}</p>
      <p>Total notifications: {notifications.length}</p>

      {hasUnread && <button onClick={markAllAsRead}>Mark all as read</button>}

      <div>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => !notification.readAt && markAsRead(notification.id)}
            style={{
              backgroundColor: notification.readAt ? "#f0f0f0" : "#e3f2fd",
              cursor: notification.readAt ? "default" : "pointer",
              padding: "8px",
              margin: "4px 0",
              borderRadius: "4px",
            }}
          >
            {notification.content}
            {!notification.readAt && (
              <span style={{ color: "blue" }}> (Unread)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
