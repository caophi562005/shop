import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import http from "../api/http";
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiClock,
  FiX,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import { useAuthStore } from "../stores/authStore";
import envConfig from "../envConfig";
import "../assets/css/AdminChatDashboard.css";

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

interface ClientChat {
  clientId: number;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

interface ActiveChat {
  clientId: number;
  clientName: string;
  messages: Message[];
  isOpen: boolean;
  hasNewMessage: boolean;
  isTyping: boolean;
}

const AdminChatDashboard: React.FC = () => {
  const [clientList, setClientList] = useState<ClientChat[]>([]);
  const [activeChats, setActiveChats] = useState<Record<number, ActiveChat>>(
    {}
  );
  const [newMessages, setNewMessages] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [onlineClients, setOnlineClients] = useState<Set<number>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { user, isLoggedIn } = useAuthStore();
  const isStaffOrAdmin =
    user?.role.name === "SELLER" || user?.role.name === "ADMIN";

  // Kết nối WebSocket
  useEffect(() => {
    if (isLoggedIn && isStaffOrAdmin && !socketRef.current) {
      console.log(isLoggedIn, " ", isStaffOrAdmin);
      socketRef.current = io(`${envConfig.VITE_API_END_POINT}/message`, {
        withCredentials: true,
      });

      const socket = socketRef.current;

      // Lắng nghe tin nhắn mới từ client
      socket.on(
        "new-client-message",
        (data: {
          clientUserId: number;
          clientName: string;
          message: string;
          timestamp: string;
        }) => {
          console.log("New client message:", data);

          // Cập nhật danh sách client
          setClientList((prev) => {
            const updated = prev.filter(
              (c) => c.clientId !== data.clientUserId
            );
            return [
              {
                clientId: data.clientUserId,
                clientName: data.clientName,
                lastMessage: data.message,
                lastMessageTime: data.timestamp,
                messageCount: 1,
              },
              ...updated,
            ];
          });

          // Đánh dấu có tin nhắn mới nếu chat chưa mở
          setActiveChats((prev) => ({
            ...prev,
            [data.clientUserId]: {
              ...prev[data.clientUserId],
              hasNewMessage: !prev[data.clientUserId]?.isOpen,
            },
          }));
        }
      );

      // Lắng nghe tin nhắn từ staff khác
      socket.on(
        "staff-replied",
        (data: {
          staffId: number;
          staffName: string;
          clientUserId: number;
          message: string;
          timestamp: string;
        }) => {
          // Cập nhật chat nếu đang mở
          setActiveChats((prev) => {
            if (prev[data.clientUserId]) {
              return {
                ...prev,
                [data.clientUserId]: {
                  ...prev[data.clientUserId],
                  hasNewMessage: false,
                },
              };
            }
            return prev;
          });
        }
      );

      // Client online/offline
      socket.on("client-online", (data: { clientId: number; room: string }) => {
        setOnlineClients((prev) => new Set([...prev, data.clientId]));
      });

      socket.on("client-offline", (data: { clientId: number }) => {
        setOnlineClients((prev) => {
          const updated = new Set(prev);
          updated.delete(data.clientId);
          return updated;
        });
      });

      // Typing indicators
      socket.on(
        "staff-typing",
        (data: { staffId: number; clientUserId: number; typing: boolean }) => {
          if (data.staffId !== user?.id) {
            setActiveChats((prev) => ({
              ...prev,
              [data.clientUserId]: {
                ...prev[data.clientUserId],
                isTyping: data.typing,
              },
            }));
          }
        }
      );

      // Lấy danh sách client ban đầu
      socket.emit("get-client-list");
      socket.on("client-list", (clients: ClientChat[]) => {
        setClientList(clients);
      });

      socket.on("connect", () => {
        console.log("Admin connected to message namespace");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, isStaffOrAdmin]);

  // Mở chat với client
  const openClientChat = async (clientId: number, clientName: string) => {
    if (!socketRef.current) return;

    // Join vào room của client
    socketRef.current.emit("join-client-chat", { clientUserId: clientId });

    // Tải lịch sử chat
    setIsLoading(true);
    try {
      const response = await http.get<Message[]>(`/messages/${clientId}`);

      setActiveChats((prev) => ({
        ...prev,
        [clientId]: {
          clientId,
          clientName,
          messages: response.data,
          isOpen: true,
          hasNewMessage: false,
          isTyping: false,
        },
      }));

      // Lắng nghe tin nhắn realtime cho chat này
      const messageHandler = (message: Message) => {
        if (message.fromUserId === clientId || message.toUserId === clientId) {
          setActiveChats((prev) => ({
            ...prev,
            [clientId]: {
              ...prev[clientId],
              messages: [...(prev[clientId]?.messages || []), message],
            },
          }));
        }
      };

      socketRef.current.on("newMessage", messageHandler);
    } catch (error) {
      console.error("Không thể tải lịch sử chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Đóng chat với client
  const closeClientChat = (clientId: number) => {
    if (!socketRef.current) return;

    // Leave room của client
    socketRef.current.emit("leave-client-chat", { clientUserId: clientId });

    setActiveChats((prev) => {
      const updated = { ...prev };
      delete updated[clientId];
      return updated;
    });
  };

  // Gửi tin nhắn đến client
  const sendMessageToClient = (clientId: number) => {
    if (!socketRef.current || !newMessages[clientId]?.trim()) return;

    socketRef.current.emit("send-message", {
      toUserId: clientId,
      content: newMessages[clientId],
    });

    setNewMessages((prev) => ({ ...prev, [clientId]: "" }));
  };

  // Refresh danh sách client
  const refreshClientList = () => {
    if (socketRef.current) {
      socketRef.current.emit("get-client-list");
    }
  };

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    Object.keys(activeChats).forEach((clientId) => {
      const ref = messagesEndRefs.current[Number(clientId)];
      if (ref) {
        setTimeout(() => {
          ref.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });
  }, [activeChats]);

  // if (!isLoggedIn || !isStaffOrAdmin) {
  //   return (
  //     <div className="admin-chat-unauthorized">
  //       <p>Bạn không có quyền truy cập tính năng này.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="admin-chat-dashboard">
      {/* Sidebar - Danh sách client */}
      <div className="client-list-sidebar">
        <div className="sidebar-header">
          <h2>
            <FiUsers className="header-icon" />
            Khách hàng ({clientList.length})
          </h2>
          <button onClick={refreshClientList} className="refresh-btn">
            <FiRefreshCw />
          </button>
        </div>

        <div className="client-list">
          {clientList.length === 0 ? (
            <div className="empty-client-list">
              <FiMessageCircle size={48} />
              <p>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            clientList.map((client) => (
              <div
                key={client.clientId}
                className={`client-item ${
                  activeChats[client.clientId]?.isOpen ? "active" : ""
                } ${onlineClients.has(client.clientId) ? "online" : ""}`}
                onClick={() =>
                  openClientChat(client.clientId, client.clientName)
                }
              >
                <div className="client-avatar">
                  <FiUser />
                  {onlineClients.has(client.clientId) && (
                    <div className="online-indicator"></div>
                  )}
                </div>

                <div className="client-info">
                  <div className="client-name">{client.clientName}</div>
                  <div className="last-message">{client.lastMessage}</div>
                </div>

                <div className="client-meta">
                  <div className="message-time">
                    <FiClock size={12} />
                    {new Date(client.lastMessageTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  {activeChats[client.clientId]?.hasNewMessage && (
                    <div className="new-message-badge"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area - Các cửa sổ chat */}
      <div className="chat-area">
        {Object.keys(activeChats).length === 0 ? (
          <div className="no-active-chats">
            <FiMessageCircle size={64} />
            <h3>Chọn khách hàng để bắt đầu chat</h3>
            <p>Danh sách khách hàng hiển thị bên trái</p>
          </div>
        ) : (
          <div className="chat-windows">
            {Object.values(activeChats).map((chat) => (
              <div key={chat.clientId} className="chat-window-container">
                <div className="chat-window-header">
                  <div className="chat-client-info">
                    <FiUser className="client-icon" />
                    <span>{chat.clientName}</span>
                    {onlineClients.has(chat.clientId) && (
                      <span className="online-status">● Online</span>
                    )}
                    {chat.isTyping && (
                      <span className="typing-status">đang nhập...</span>
                    )}
                  </div>
                  <button
                    onClick={() => closeClientChat(chat.clientId)}
                    className="close-chat-btn"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="chat-messages-container">
                  {chat.messages.length === 0 ? (
                    <div className="empty-chat">Chưa có tin nhắn nào</div>
                  ) : (
                    chat.messages.map((msg) => {
                      const isFromClient = msg.fromUserId === chat.clientId;

                      return (
                        <div
                          key={msg.id}
                          className={`admin-message-bubble ${
                            isFromClient ? "from-client" : "from-support"
                          }`}
                        >
                          <div className="message-sender">
                            {isFromClient ? chat.clientName : msg.fromUser.name}
                          </div>
                          <p className="message-content">{msg.content}</p>
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div
                    ref={(el) => {
                      messagesEndRefs.current[chat.clientId] = el;
                    }}
                  />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageToClient(chat.clientId);
                  }}
                  className="chat-input-form"
                >
                  <input
                    type="text"
                    value={newMessages[chat.clientId] || ""}
                    onChange={(e) =>
                      setNewMessages((prev) => ({
                        ...prev,
                        [chat.clientId]: e.target.value,
                      }))
                    }
                    placeholder={`Trả lời ${chat.clientName}...`}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessages[chat.clientId]?.trim() || isLoading}
                  >
                    <FiSend />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatDashboard;
