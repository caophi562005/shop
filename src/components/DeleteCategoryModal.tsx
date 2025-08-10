import React, { useState } from "react";
import type { CategoryType } from "../models/shared/shared-category.model";
import http from "../api/http";

type Props = {
  isOpen: boolean;
  category: CategoryType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const DeleteCategoryModal: React.FC<Props> = ({
  isOpen,
  category,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!category) return;

    setLoading(true);

    try {
      await http.delete(`/categories/${category.id}`);

      onSuccess("Xóa danh mục thành công");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) return null;

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
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <strong>
                #{category.id} - {category.name}
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

export default DeleteCategoryModal;
