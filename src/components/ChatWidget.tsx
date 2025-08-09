import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import http from "../api/http";
import "../assets/css/ChatWidget.css";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";
import envConfig from "../envConfig";

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
  fromUser: {
    id: number;
    name: string;
  };
}

// ID của support (giả sử 0 là support)
const SUPPORT_USER_ID = 0;

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn } = useAuthStore();
  const myUserId = user?.id;

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen]);

  // Kết nối WebSocket
  useEffect(() => {
    if (isLoggedIn && myUserId && !socketRef.current) {
      socketRef.current = io(`${envConfig.VITE_API_END_POINT}/message`, {
        withCredentials: true,
      });

      // Lắng nghe tin nhắn mới từ support
      socketRef.current.on("newMessage", (message: Message) => {
        console.log("Received message:", message);

        // Chỉ hiển thị tin nhắn liên quan đến user hiện tại
        if (
          (message.fromUserId === myUserId &&
            message.toUserId === SUPPORT_USER_ID) ||
          (message.fromUserId === SUPPORT_USER_ID &&
            message.toUserId === myUserId)
        ) {
          setMessages((prevMessages) => {
            // Tránh duplicate tin nhắn
            const exists = prevMessages.find(
              (m) =>
                m.id === message.id ||
                (m.content === message.content &&
                  Math.abs(
                    new Date(m.createdAt).getTime() -
                      new Date(message.createdAt).getTime()
                  ) < 1000)
            );

            if (exists) return prevMessages;

            return [...prevMessages, message];
          });
        }
      });

      // Lắng nghe typing indicator từ support
      socketRef.current.on("support-typing", (data: { typing: boolean }) => {
        setIsTyping(data.typing);
      });

      // Xử lý khi connect thành công
      socketRef.current.on("connect", () => {
        console.log("Connected to message namespace");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from message namespace");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, myUserId]);

  // Tải lịch sử chat khi mở widget
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!isOpen || !myUserId) return;

      setIsLoading(true);
      try {
        const response = await http.get<Message[]>(
          `/messages/${SUPPORT_USER_ID}`
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

    if (!newMessage.trim() || !socketRef.current || !myUserId) return;

    // Gửi tin nhắn qua socket
    socketRef.current.emit("send-message", {
      toUserId: SUPPORT_USER_ID,
      content: newMessage,
    });

    // Hiển thị tạm thời tin nhắn vừa gửi
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: newMessage,
        fromUserId: myUserId,
        toUserId: SUPPORT_USER_ID,
        createdAt: new Date().toISOString(),
        fromUser: { id: myUserId, name: user?.name || "Me" },
      },
    ]);

    setNewMessage("");
  };

  // Không hiển thị widget nếu chưa đăng nhập
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <h3>Hỗ trợ trực tuyến</h3>
              {isTyping && (
                <div className="typing-indicator">Support đang nhập...</div>
              )}
            </div>
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
              messages.map((msg) => {
                const isMyMessage = msg.fromUserId === myUserId;

                return (
                  <div
                    key={msg.id}
                    className={`message-bubble ${
                      isMyMessage ? "sent" : "received"
                    }`}
                  >
                    {!isMyMessage && (
                      <div className="sender-name">{msg.fromUser.name}</div>
                    )}
                    <p className="message-content">{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
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
