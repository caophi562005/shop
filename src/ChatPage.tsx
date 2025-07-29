// src/ChatPage.tsx

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import http from "./http";
import { jwtDecode } from "jwt-decode";

// Định nghĩa kiểu cho payload của JWT
interface JwtPayload {
  userId: number;
  // ... các trường khác trong token
}

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
}

const ChatPage = () => {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Lấy ID của người dùng hiện tại từ access token trong localStorage
  const myUserId = useMemo(() => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return null;
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      return decodedToken.userId;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  // useEffect chính để xử lý logic tải lịch sử và kết nối websocket
  useEffect(() => {
    // Hàm để gọi API lấy lịch sử chat
    const fetchHistory = async () => {
      if (!otherUserId) return;
      try {
        const response = await http.get<Message[]>(`/messages/${otherUserId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Không thể tải lịch sử chat", error);
      }
    };

    // Chỉ chạy logic khi đã lấy được ID của người dùng hiện tại
    if (myUserId) {
      // 1. Tải lịch sử chat
      fetchHistory();

      // 2. Kết nối WebSocket
      const accessToken = localStorage.getItem("accessToken")!;
      const newSocket = io("http://localhost:3003/message", {
        extraHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSocket(newSocket);

      // 3. Lắng nghe tin nhắn mới
      newSocket.on("newMessage", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // 4. Hàm dọn dẹp khi component bị hủy
      return () => {
        newSocket.off("newMessage");
        newSocket.disconnect();
      };
    }
  }, [otherUserId, myUserId]); // Chạy lại khi chat với người khác

  // useEffect để tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Hàm xử lý việc gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && otherUserId) {
      socket.emit("send-message", {
        toUserId: parseInt(otherUserId, 10),
        content: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div>
      <h1>Chat với User {otherUserId}</h1>
      <div ref={chatBoxRef} className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.fromUserId === myUserId ? "sent" : "received"
            }`}
          >
            <p className="message-content">{msg.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ width: "80%", padding: "10px" }}
          placeholder="Nhập tin nhắn..."
        />
        <button type="submit" style={{ width: "18%", padding: "10px" }}>
          Gửi
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
