import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import http from "../api/http";
import "../assets/css/ChatWidget.css";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";

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
    console.log("Start WS");
    console.log(isLoggedIn, " ", myUserId);
    if (isLoggedIn && myUserId && !socketRef.current) {
      socketRef.current = io("localhost:3003/message", {
        withCredentials: true,
      });

      // Lắng nghe tin nhắn mới từ admin
      socketRef.current.on("newMessage", (message: Message) => {
        if (
          (message.fromUserId === ADMIN_USER_ID &&
            message.toUserId === myUserId) ||
          (message.fromUserId === myUserId &&
            message.toUserId === ADMIN_USER_ID)
        ) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
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

    if (!newMessage.trim() || !socketRef.current || !myUserId) return;

    // Gửi tin nhắn qua socket
    socketRef.current.emit("send-message", {
      toUserId: ADMIN_USER_ID,
      content: newMessage,
    });

    // Thêm tin nhắn vào UI ngay lập tức (optimistic update)
    // const tempMessage: Message = {
    //   id: Date.now(),
    //   content: newMessage,
    //   fromUserId: myUserId,
    //   toUserId: ADMIN_USER_ID,
    //   createdAt: new Date().toISOString(),
    // };

    // setMessages((prev) => [...prev, tempMessage]);
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
