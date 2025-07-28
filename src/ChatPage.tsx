// src/ChatPage.tsx

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import http from "./http";

// Định nghĩa kiểu dữ liệu cho một tin nhắn
interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  createdAt: string;
}

const ChatPage = () => {
  // Lấy `userId` của người muốn chat từ URL, ví dụ: /chat/2
  const { userId: otherUserId } = useParams<{ userId: string }>();

  // State để lưu danh sách tin nhắn
  const [messages, setMessages] = useState<Message[]>([]);
  // State cho nội dung tin nhắn đang gõ
  const [newMessage, setNewMessage] = useState("");
  // State để lưu instance của socket
  const [socket, setSocket] = useState<Socket | null>(null);
  // Ref để trỏ tới khung chat, giúp tự động cuộn
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- BƯỚC 1: LẤY LỊCH SỬ CHAT KHI VÀO TRANG ---
    const fetchHistory = async () => {
      if (!otherUserId) return;
      try {
        const response = await http.get<Message[]>(`/messages/${otherUserId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Không thể tải lịch sử chat", error);
      }
    };

    fetchHistory();

    // --- BƯỚC 2: KẾT NỐI WEBSOCKET ---
    // Lấy access token từ localStorage để xác thực
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Vui lòng đăng nhập để chat!");
      return;
    }

    // Thay đổi URL nếu server websocket của bạn chạy ở port/namespace khác
    // Nếu muốn kết nối tới namespace "/message", thêm nó vào URL
    const newSocket = io("http://localhost:3003/message", {
      // Đưa namespace vào URL
      // Không còn thuộc tính namespace ở đây
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setSocket(newSocket);

    // --- BƯỚC 3: LẮNG NGHE TIN NHẮN MỚI ---
    newSocket.on("newMessage", (message: Message) => {
      // Khi có tin nhắn mới, thêm nó vào danh sách tin nhắn hiện tại
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // --- BƯỚC 4: DỌN DẸP KHI RỜI TRANG ---
    // Hàm này sẽ được gọi khi component unmount (rời khỏi trang chat)
    return () => {
      newSocket.off("newMessage"); // Gỡ bỏ listener
      newSocket.disconnect(); // Ngắt kết nối socket
    };
  }, [otherUserId]); // useEffect sẽ chạy lại nếu bạn chuyển sang chat với người khác

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && otherUserId) {
      // Gửi sự kiện 'send-message' lên server
      socket.emit("send-message", {
        toUserId: parseInt(otherUserId, 10),
        content: newMessage,
      });
      // Xóa nội dung trong ô input
      setNewMessage("");
    }
  };

  return (
    <div>
      <h1>Chat với User {otherUserId}</h1>
      <div
        ref={chatBoxRef}
        style={{
          height: "400px",
          border: "1px solid #ccc",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>User {msg.fromUserId}:</strong> {msg.content}
            <br />
            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
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
