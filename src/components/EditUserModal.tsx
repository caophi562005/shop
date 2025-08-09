import React, { useState, useEffect } from "react";
import type { UpdateUserBodyType, UserDetailType } from "../models/user.model";
import http from "../api/http";
import { RoleName } from "../constants/role.constant";
import type { UserStatusType } from "../constants/auth.constant";

type Props = {
  isOpen: boolean;
  user: UserDetailType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const EditUserModal: React.FC<Props> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<UpdateUserBodyType>({
    email: "",
    name: "",
    phoneNumber: "",
    avatar: "",
    password: "",
    roleId: 2,
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber ?? "",
        avatar: user.avatar ?? "",
        password: "",
        roleId: user.roleId,
        status: user.status,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      await http.put(`/users/${user.id}`, formData);

      onSuccess("Cập nhật người dùng thành công");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chỉnh sửa người dùng #{user.id}</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>ID</label>
              <input type="text" value={user.id} disabled />
            </div>
            <div className="form-group">
              <label>Ngày tạo</label>
              <input
                type="text"
                value={formatDate(String(user.createdAt))}
                disabled
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Tên *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input
              autoComplete="off"
              type="text"
              value={formData.avatar ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu (để trống nếu không muốn thay đổi)</label>
            <input
              type="password"
              autoComplete="off"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Vai trò *</label>
            <select
              value={formData.roleId}
              onChange={(e) =>
                setFormData({ ...formData, roleId: Number(e.target.value) })
              }
              required
              disabled={loading}
            >
              <option value={1}>{RoleName.ADMIN}</option>
              <option value={3}>{RoleName.SELLER}</option>
              <option value={2}>{RoleName.CLIENT}</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái *</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as UserStatusType,
                })
              }
              required
              disabled={loading}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BLOCK">BLOCK</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Người tạo</label>
              <input type="text" value={user.createdById || "N/A"} disabled />
            </div>
            <div className="form-group">
              <label>Người cập nhật</label>
              <input type="text" value={user.updatedById || "N/A"} disabled />
            </div>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
