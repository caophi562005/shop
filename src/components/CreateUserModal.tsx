import React, { useState } from "react";
import { RoleName } from "../constants/role.constant";
import { UserStatus, type UserStatusType } from "../constants/auth.constant";
import type { CreateUserBodyType } from "../models/user.model";
import http from "../api/http";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const CreateUserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<CreateUserBodyType>({
    email: "",
    name: "",
    phoneNumber: "",
    avatar: "",
    password: "",
    roleId: 2,
    status: UserStatus.ACTIVE,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await http.post("/users", formData);
      onSuccess("Tạo người dùng thành công");
      resetForm();
      onClose();
      onRefresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phoneNumber: "",
      avatar: "",
      password: "",
      roleId: 3,
      status: "ACTIVE",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo người dùng mới</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
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
            <label>Số điện thoại *</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="text"
              value={formData.avatar ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
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
              <option value={UserStatus.ACTIVE}>{UserStatus.ACTIVE}</option>
              <option value={UserStatus.INACTIVE}>{UserStatus.INACTIVE}</option>
              <option value={UserStatus.BLOCKED}>{UserStatus.BLOCKED}</option>
            </select>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
