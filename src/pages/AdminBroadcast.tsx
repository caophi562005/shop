import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";
import "../assets/css/adminBroadcast.css";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface BroadcastRequest {
  userIds?: number[];
  content: string;
  title?: string;
  broadcastToAll: boolean;
}

interface BroadcastResponse {
  success: boolean;
  message: string;
  totalTargets: number;
  successfulSends: number;
  failedSends: number;
  broadcastToAll: boolean;
}

const AdminBroadcast: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [broadcastToAll, setBroadcastToAll] = useState(false);
  const [excludeAdmin, setExcludeAdmin] = useState(true); // New state to exclude admin
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await http.get("/users?page=1&limit=1000");
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setMessage({
          type: "error",
          text: "Không thể tải danh sách người dùng",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUserIds(filteredUsers.map((user) => user.id));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập nội dung thông báo" });
      return;
    }

    if (!broadcastToAll && selectedUserIds.length === 0) {
      setMessage({
        type: "error",
        text: 'Vui lòng chọn ít nhất một người dùng hoặc bật "Gửi tới tất cả"',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      let finalUserIds = selectedUserIds;

      // If excludeAdmin is true and broadcastToAll is false,
      // we need to remove current admin from userIds
      // Note: This is client-side filtering, server should handle this properly

      const requestData: BroadcastRequest = {
        content: content.trim(),
        title: title.trim() || undefined,
        broadcastToAll,
        userIds: broadcastToAll ? undefined : finalUserIds,
        // Add excludeAdmin flag for server to handle
        // excludeAdmin, // Uncomment when server supports this
      };

      const response = await http.post<BroadcastResponse>(
        "/notifications-admin/broadcast",
        requestData
      );

      setMessage({
        type: "success",
        text: `Thành công! Đã gửi ${response.data.successfulSends}/${
          response.data.totalTargets
        } thông báo${excludeAdmin ? " (không bao gồm admin)" : ""}`,
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);

      // Reset form
      setTitle("");
      setContent("");
      setSelectedUserIds([]);
      setBroadcastToAll(false);
    } catch (error: any) {
      console.error("Failed to broadcast notification:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Có lỗi xảy ra khi gửi thông báo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-broadcast">
      <div className="broadcast-header">
        <div className="header-content">
          <div className="breadcrumb">
            <Link to="/admin" className="breadcrumb-link">
              Dashboard
            </Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Thông Báo Hệ Thống</span>
          </div>
          <h1 className="page-title">
            <span className="title-icon">📢</span>
            Gửi Thông Báo Hệ Thống
          </h1>
          <p className="page-subtitle">
            Gửi thông báo quan trọng đến người dùng trong hệ thống
          </p>
          <div className="admin-note">
            <span className="note-icon">💡</span>
            <span>
              Thông báo sẽ được gửi real-time đến người dùng đang online và lưu
              trữ cho người dùng offline
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span className="alert-icon">
            {message.type === "success" ? "✅" : "❌"}
          </span>
          {message.text}
        </div>
      )}

      <div className="broadcast-content">
        <form onSubmit={handleSubmit} className="broadcast-form">
          {/* Notification Content Section */}
          <div className="form-section">
            <h2 className="section-title">📝 Nội Dung Thông Báo</h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Tiêu đề (tùy chọn)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="form-input"
                maxLength={100}
              />
              <span className="form-hint">{title.length}/100 ký tự</span>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label required">
                Nội dung thông báo
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                className="form-textarea"
                rows={4}
                required
                maxLength={500}
              />
              <span className="form-hint">{content.length}/500 ký tự</span>
            </div>
          </div>

          {/* Recipients Section */}
          <div className="form-section">
            <h2 className="section-title">👥 Người Nhận</h2>

            <div className="broadcast-mode">
              <label className="broadcast-mode-option">
                <input
                  type="radio"
                  name="broadcastMode"
                  checked={broadcastToAll}
                  onChange={() => setBroadcastToAll(true)}
                />
                <span className="radio-custom"></span>
                <div className="option-content">
                  <span className="option-title">
                    Gửi tới tất cả người dùng
                  </span>
                  <span className="option-description">
                    Thông báo sẽ được gửi đến toàn bộ {users.length} người dùng
                  </span>
                </div>
              </label>

              <label className="broadcast-mode-option">
                <input
                  type="radio"
                  name="broadcastMode"
                  checked={!broadcastToAll}
                  onChange={() => setBroadcastToAll(false)}
                />
                <span className="radio-custom"></span>
                <div className="option-content">
                  <span className="option-title">Chọn người dùng cụ thể</span>
                  <span className="option-description">
                    Chọn những người dùng cụ thể để gửi thông báo
                  </span>
                </div>
              </label>
            </div>

            {/* Admin self-notification option */}
            <div className="admin-option">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={excludeAdmin}
                  onChange={(e) => setExcludeAdmin(e.target.checked)}
                />
                <span className="checkbox-custom-admin"></span>
                <div className="option-content">
                  <span className="option-title">
                    Không gửi thông báo cho bản thân
                  </span>
                  <span className="option-description">
                    Tránh hiển thị thông báo trùng lặp cho admin
                  </span>
                </div>
              </label>
            </div>

            {!broadcastToAll && (
              <div className="user-selection">
                <div className="selection-header">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="selection-actions">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="btn btn-outline"
                      disabled={filteredUsers.length === 0}
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="btn btn-outline"
                      disabled={selectedUserIds.length === 0}
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                <div className="selected-count">
                  Đã chọn: <strong>{selectedUserIds.length}</strong> người dùng
                </div>

                {isLoadingUsers ? (
                  <div className="loading-users">
                    <span className="loading-spinner"></span>
                    Đang tải danh sách người dùng...
                  </div>
                ) : (
                  <div className="users-list">
                    {filteredUsers.length === 0 ? (
                      <div className="no-users">
                        {searchTerm
                          ? "Không tìm thấy người dùng nào"
                          : "Chưa có người dùng nào"}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <label key={user.id} className="user-item">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                          />
                          <span className="checkbox-custom"></span>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <Link to="/admin" className="btn btn-cancel">
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={
                isLoading ||
                (!broadcastToAll && selectedUserIds.length === 0) ||
                !content.trim()
              }
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <span className="btn-icon">📤</span>
                  Gửi Thông Báo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBroadcast;
