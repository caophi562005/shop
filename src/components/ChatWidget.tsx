import React, { useState, useEffect, useRef } from "react";
import http from "../api/http";
import "../assets/css/ChatWidget.css";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";
import { useMessageSocket } from "../hooks/useMessageSocket";

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
}

// ID của admin
const ADMIN_USER_ID = 1;

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, isInitialized } = useAuthStore();
  const myUserId = user?.id;

  // Use the message socket hook
  const { sendMessage, onNewMessage, joinMessageRoom, isConnected } =
    useMessageSocket();

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen]);

  // Listen for new messages
  useEffect(() => {
    if (!isLoggedIn || !myUserId) return;

    const cleanup = onNewMessage((message: Message) => {
      if (
        (message.fromUserId === ADMIN_USER_ID &&
          message.toUserId === myUserId) ||
        (message.fromUserId === myUserId && message.toUserId === ADMIN_USER_ID)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return cleanup;
  }, [isLoggedIn, myUserId, onNewMessage]);

  // Join message room when connected and user is available
  useEffect(() => {
    if (isConnected && myUserId) {
      joinMessageRoom(ADMIN_USER_ID);
    }
  }, [isConnected, myUserId, joinMessageRoom]);

  // Tải lịch sử chat khi mở widget
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!isOpen || !myUserId) return;

      setIsLoading(true);
      try {
        const response = await http.get<Message[]>(
          `/messages/${ADMIN_USER_ID}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Không thể tải lịch sử chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [isOpen, myUserId]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !myUserId) return;

    // Gửi tin nhắn qua socket hook
    sendMessage(ADMIN_USER_ID, newMessage);
    setNewMessage("");
  };

  // Không hiển thị widget nếu chưa đăng nhập
  if (!isLoggedIn) {
    return null;
  }

  // Chỉ hiển thị ChatWidget khi đã kiểm tra auth và user đã đăng nhập
  if (!isInitialized || !isLoggedIn) {
    return null;
  }

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Hỗ trợ trực tuyến</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FiX />
            </button>
          </div>

          <div className="chat-messages">
            {isLoading ? (
              <div className="loading-messages">Đang tải tin nhắn...</div>
            ) : messages.length === 0 ? (
              <div className="empty-messages">
                Chào bạn! Chúng tôi có thể giúp gì cho bạn?
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    msg.fromUserId === myUserId ? "sent" : "received"
                  }`}
                >
                  <p className="message-content">{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              autoFocus
              disabled={!myUserId || isLoading}
            />
            <button
              type="submit"
              disabled={!myUserId || isLoading || !newMessage.trim()}
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-button"
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? <FiX /> : <FiMessageSquare />}
      </button>
    </div>
  );
};

export default ChatWidget;
