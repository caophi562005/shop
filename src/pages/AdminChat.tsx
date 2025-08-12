import React, { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import "../assets/css/adminChat.css";
import envConfig from "../envConfig";
import http from "../api/http";

interface User {
  id: number;
  name: string;
}

interface Conversation {
  user: User;
  lastMessage: {
    id: number;
    fromUserId: number;
    toUserId: number;
    content: string;
    createdAt: string;
  };
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: string;
  fromUser?: User;
}

// Helper function to generate room ID
const generateRoomUserId = (userId: number) => `userId-${userId}`;

const ADMIN_USER_ID = 1; // ID của admin

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRoomRef = useRef<string | null>(null);

  // Auto scroll to bottom when new messages arrive - only scroll within chat container
  useEffect(() => {
    if (messages.length > 0 && selectedUser) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [messages, selectedUser]);

  // Fetch initial conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await http.get("/messages");
        setConversations(response.data);
      } catch (error) {
        console.error("Cannot load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Message handler function
  const handleNewMessage = useCallback(
    (message: Message) => {
      const otherUserId =
        message.fromUserId === ADMIN_USER_ID
          ? message.toUserId
          : message.fromUserId;

      // Update conversations list
      setConversations((prevConversations) => {
        const existingConvIndex = prevConversations.findIndex(
          (conv) => conv.user.id === otherUserId
        );

        if (existingConvIndex === -1) return prevConversations;

        const updatedConversations = [...prevConversations];
        const [updated] = updatedConversations.splice(existingConvIndex, 1);
        updated.lastMessage = {
          id: message.id,
          fromUserId: message.fromUserId,
          toUserId: message.toUserId,
          content: message.content,
          createdAt: message.createdAt,
        };
        return [updated, ...updatedConversations];
      });

      // Only update messages if the conversation is selected and message doesn't already exist
      if (
        selectedUser &&
        (message.fromUserId === selectedUser.id ||
          message.toUserId === selectedUser.id)
      ) {
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(
            (msg) => msg.id === message.id
          );
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      }
    },
    [selectedUser]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${envConfig.VITE_API_END_POINT}/message`, {
        withCredentials: true,
      });

      // Global message listener
      socketRef.current.on("newMessage", handleNewMessage);
    }

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage", handleNewMessage);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [handleNewMessage]);

  // Handle user selection and room joining
  useEffect(() => {
    const loadUserMessages = async () => {
      if (!selectedUser || !socketRef.current) return;

      // Leave previous room if exists
      if (currentRoomRef.current) {
        socketRef.current.emit("leaveMessageRoom", currentRoomRef.current);
      }

      // Join new room
      const newRoom = generateRoomUserId(selectedUser.id);
      socketRef.current.emit("joinMessageRoom", newRoom);
      currentRoomRef.current = newRoom;

      // Load message history
      setIsLoadingMessages(true);
      try {
        const response = await http.get(`/messages/${selectedUser.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Cannot load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadUserMessages();
  }, [selectedUser]);

  // Send message handler
  const handleSendMessage = useCallback(() => {
    if (!selectedUser || !newMessage.trim() || !socketRef.current) return;

    // Send message via socket
    socketRef.current.emit("send-message", {
      toUserId: selectedUser.id,
      content: newMessage.trim(),
    });

    setNewMessage("");
  }, [selectedUser, newMessage]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className="admin-chat">
      {/* Conversations Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Admin Messages</h2>
          <p>Manage customer conversations</p>
        </div>

        <div className="conversations-list">
          {isLoading ? (
            <div className="loading-state">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="loading-state">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user.id}
                onClick={() => setSelectedUser(conv.user)}
                className={`conversation-item ${
                  selectedUser?.id === conv.user.id ? "active" : ""
                }`}
              >
                <div className="conversation-header">
                  <h3 className="conversation-name">{conv.user.name}</h3>
                  <span className="conversation-time">
                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <p className="conversation-preview">
                  {conv.lastMessage.fromUserId === ADMIN_USER_ID && (
                    <span className="sent-prefix">You: </span>
                  )}
                  {conv.lastMessage.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="user-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{selectedUser.name}</h3>
                  <p>User ID: {selectedUser.id}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              {isLoadingMessages ? (
                <div className="loading-state">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="loading-state">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="message-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-wrapper ${
                        msg.fromUserId === ADMIN_USER_ID ? "sent" : "received"
                      }`}
                    >
                      <div className="message-bubble">
                        <p className="message-content">{msg.content}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="message-input">
              <div className="input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoadingMessages}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoadingMessages}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3>Select a conversation</h3>
            <p>Choose a user from the left sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
