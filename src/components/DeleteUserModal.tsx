import React, { useState } from "react";
import type { UserDetailType } from "../models/user.model";
import http from "../api/http";

type Props = {
  isOpen: boolean;
  user: UserDetailType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const DeleteUserModal: React.FC<Props> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await http.delete(`/users/${user.id}`);

      onSuccess("Xóa người dùng thành công");
      onClose();
      onRefresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Xác nhận xóa</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="delete-confirmation">
            <i className="fas fa-exclamation-triangle warning-icon"></i>
            <p>
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <strong>
                #{user.id} - {user.name}
              </strong>
              ?
            </p>
            <p className="warning-text">Hành động này không thể hoàn tác!</p>
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
          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
